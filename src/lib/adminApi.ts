import { supabase } from './supabase';
import { calculatePredictionPoints } from './scoring';
import type { MatchImportItem } from '../types';

type PredictionResultRow = {
  id: string;
  predicted_home_score: number;
  predicted_away_score: number;
};

export async function finishMatchAndRecalculatePoints(params: {
  matchId: string;
  homeScore: number;
  awayScore: number;
}) {
  const { matchId, homeScore, awayScore } = params;

  const { error: matchError } = await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: 'finished',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (matchError) {
    throw matchError;
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select(
      `
      id,
      predicted_home_score,
      predicted_away_score
    `
    )
    .eq('match_id', matchId);

  if (predictionsError) {
    throw predictionsError;
  }

  const predictionRows = (predictions ?? []) as PredictionResultRow[];

  await Promise.all(
    predictionRows.map((prediction) => {
      const result = calculatePredictionPoints(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        homeScore,
        awayScore
      );

      return supabase
        .from('predictions')
        .update({
          points: result.points,
          exact_score: result.exactScore,
          correct_outcome: result.correctOutcome,
          updated_at: new Date().toISOString(),
        })
        .eq('id', prediction.id);
    })
  );

  return {
    updatedPredictions: predictionRows.length,
  };
}

export async function reopenMatch(params: { matchId: string }) {
  const { matchId } = params;

  const { error: matchError } = await supabase
    .from('matches')
    .update({
      home_score: null,
      away_score: null,
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (matchError) {
    throw matchError;
  }

  const { error: predictionsError } = await supabase
    .from('predictions')
    .update({
      points: 0,
      exact_score: false,
      correct_outcome: false,
      updated_at: new Date().toISOString(),
    })
    .eq('match_id', matchId);

  if (predictionsError) {
    throw predictionsError;
  }
}

export async function importMatchesFromJson(matches: MatchImportItem[]) {
  if (!Array.isArray(matches) || matches.length === 0) {
    throw new Error('O ficheiro JSON não contém jogos para importar.');
  }

  const rows = matches.map((match) => ({
    external_id: match.externalId,
    match_number: match.matchNumber,
    stage: match.stage,
    group_name: match.groupName ?? null,

    home_team: match.homeTeam ?? match.homeTeamPlaceholder ?? 'A definir',
    away_team: match.awayTeam ?? match.awayTeamPlaceholder ?? 'A definir',
    home_team_code: match.homeTeamCode ?? null,
    away_team_code: match.awayTeamCode ?? null,

    home_team_placeholder: match.homeTeamPlaceholder ?? null,
    away_team_placeholder: match.awayTeamPlaceholder ?? null,

    stadium: match.stadium,
    city: match.city,
    country: match.country,
    kickoff_utc: match.kickoffUtc,

    status: match.status ?? 'scheduled',
    source: match.source ?? 'json-import',
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('matches').upsert(rows, {
    onConflict: 'external_id',
  });

  if (error) {
    throw error;
  }

  return {
    importedMatches: rows.length,
  };
}

export async function updateKnockoutMatchTeams(params: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
}) {
  const { matchId, homeTeam, awayTeam, homeTeamCode, awayTeamCode } = params;

  const cleanHomeTeam = homeTeam.trim();
  const cleanAwayTeam = awayTeam.trim();
  const cleanHomeTeamCode = homeTeamCode?.trim().toUpperCase() || null;
  const cleanAwayTeamCode = awayTeamCode?.trim().toUpperCase() || null;

  if (!cleanHomeTeam || !cleanAwayTeam) {
    throw new Error('Preenche as duas equipas.');
  }

  const { error } = await supabase
    .from('matches')
    .update({
      home_team: cleanHomeTeam,
      away_team: cleanAwayTeam,
      home_team_code: cleanHomeTeamCode,
      away_team_code: cleanAwayTeamCode,
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (error) {
    throw error;
  }
}