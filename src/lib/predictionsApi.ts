import { supabase } from './supabase';
import type { Prediction } from '../types';

type PredictionRow = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points: number | null;
  exact_score: boolean | null;
  correct_outcome: boolean | null;
};

export async function getMyPredictions(userId: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select(
      `
      id,
      user_id,
      match_id,
      predicted_home_score,
      predicted_away_score,
      points,
      exact_score,
      correct_outcome
    `
    )
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPredictionRowToPrediction);
}

export async function upsertMyPrediction(params: {
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}): Promise<Prediction> {
  const { userId, matchId, predictedHomeScore, predictedAwayScore } = params;

  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        predicted_home_score: predictedHomeScore,
        predicted_away_score: predictedAwayScore,
        points: 0,
        exact_score: false,
        correct_outcome: false,
      },
      {
        onConflict: 'user_id,match_id',
      }
    )
    .select(
      `
      id,
      user_id,
      match_id,
      predicted_home_score,
      predicted_away_score,
      points,
      exact_score,
      correct_outcome
    `
    )
    .single();

  if (error) {
    throw error;
  }

  return mapPredictionRowToPrediction(data);
}

function mapPredictionRowToPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    predictedHomeScore: row.predicted_home_score,
    predictedAwayScore: row.predicted_away_score,
    points: row.points ?? 0,
    exactScore: row.exact_score ?? false,
    correctOutcome: row.correct_outcome ?? false,
  };
}