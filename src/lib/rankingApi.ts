import { supabase } from './supabase';
import type { RankingRow } from '../types';

type RankingViewRow = {
  user_id: string;
  name: string;
  total_points: number | null;
  exact_scores: number | null;
  correct_outcomes: number | null;
  total_predictions: number | null;
};

export async function getRanking(): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from('ranking_view')
    .select(
      `
      user_id,
      name,
      total_points,
      exact_scores,
      correct_outcomes,
      total_predictions
    `
    )
    .order('total_points', { ascending: false })
    .order('exact_scores', { ascending: false })
    .order('correct_outcomes', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRankingViewRowToRankingRow);
}

function mapRankingViewRowToRankingRow(row: RankingViewRow): RankingRow {
  return {
    userId: row.user_id,
    name: row.name,
    totalPoints: row.total_points ?? 0,
    exactScores: row.exact_scores ?? 0,
    correctOutcomes: row.correct_outcomes ?? 0,
    totalPredictions: row.total_predictions ?? 0,
  };
}