import { supabase } from './supabase';

export type MatchPredictionStats = {
  total: number;
  homeWinPercent: number;
  drawPercent: number;
  awayWinPercent: number;
};

type PredictionStatsRow = {
  predicted_home_score: number;
  predicted_away_score: number;
};

export async function getMatchPredictionStats(matchId: string) {
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select(
      `
      predicted_home_score,
      predicted_away_score
    `
    )
    .eq('match_id', matchId);

  if (error) {
    throw error;
  }

  return calculateStats((predictions ?? []) as PredictionStatsRow[]);
}

function calculateStats(predictions: PredictionStatsRow[]): MatchPredictionStats {
  const total = predictions.length;

  if (total === 0) {
    return {
      total: 0,
      homeWinPercent: 0,
      drawPercent: 0,
      awayWinPercent: 0,
    };
  }

  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;

  for (const prediction of predictions) {
    if (prediction.predicted_home_score > prediction.predicted_away_score) {
      homeWins += 1;
      continue;
    }

    if (prediction.predicted_home_score < prediction.predicted_away_score) {
      awayWins += 1;
      continue;
    }

    draws += 1;
  }

  return {
    total,
    homeWinPercent: Math.round((homeWins / total) * 100),
    drawPercent: Math.round((draws / total) * 100),
    awayWinPercent: Math.round((awayWins / total) * 100),
  };
}