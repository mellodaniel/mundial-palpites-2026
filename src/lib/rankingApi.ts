import { supabase } from './supabase';
import type { RankingRow } from '../types';

type PredictionRankingRow = {
  user_id: string;
  points: number | null;
  exact_score: boolean | null;
  correct_outcome: boolean | null;
};

type ProfileRankingRow = {
  id: string;
  name: string | null;
};

type LeagueMemberRow = {
  user_id: string;
};

export async function getRanking(params?: {
  leagueId?: string;
}): Promise<RankingRow[]> {
  const userIds = params?.leagueId
    ? await getLeagueMemberIds(params.leagueId)
    : await getAllProfileIds();

  if (userIds.length === 0) {
    return [];
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select(
      `
      user_id,
      points,
      exact_score,
      correct_outcome
    `
    )
    .in('user_id', userIds);

  if (predictionsError) {
    throw predictionsError;
  }

  const predictionRows = (predictions ?? []) as PredictionRankingRow[];

  const profiles = await getProfilesByIds(userIds);
  const profilesMap = new Map(profiles.map((profile) => [profile.id, profile]));

  const rankingMap = new Map<string, RankingRow>();

  for (const userId of userIds) {
    const profile = profilesMap.get(userId);

    rankingMap.set(userId, {
      userId,
      name: profile?.name || 'Utilizador',
      totalPoints: 0,
      exactScores: 0,
      correctOutcomes: 0,
      totalPredictions: 0,
    });
  }

  for (const prediction of predictionRows) {
    const current = rankingMap.get(prediction.user_id);

    if (!current) continue;

    current.totalPoints += prediction.points ?? 0;
    current.exactScores += prediction.exact_score ? 1 : 0;
    current.correctOutcomes += prediction.correct_outcome ? 1 : 0;
    current.totalPredictions += 1;
  }

  return Array.from(rankingMap.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    if (b.exactScores !== a.exactScores) {
      return b.exactScores - a.exactScores;
    }

    if (b.correctOutcomes !== a.correctOutcomes) {
      return b.correctOutcomes - a.correctOutcomes;
    }

    return a.name.localeCompare(b.name);
  });
}

async function getAllProfileIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as { id: string }[]).map((profile) => profile.id);
}

async function getLeagueMemberIds(leagueId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('league_members')
    .select('user_id')
    .eq('league_id', leagueId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as LeagueMemberRow[]).map((member) => member.user_id);
}

async function getProfilesByIds(userIds: string[]): Promise<ProfileRankingRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      name
    `
    )
    .in('id', userIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as ProfileRankingRow[];
}