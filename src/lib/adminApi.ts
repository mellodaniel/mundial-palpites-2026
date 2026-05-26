import { supabase } from './supabase';
import { calculatePredictionPoints } from './scoring';

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