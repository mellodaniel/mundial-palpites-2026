import { supabase } from './supabase';

export type AccountStatus = 'active' | 'disabled' | 'blocked' | 'deleted';

export type AdminUserRow = {
  id: string;
  name: string;
  isAdmin: boolean;
  accountStatus: AccountStatus;
  adminNote?: string;
  createdAt: string;
  totalPredictions: number;
  totalPoints: number;
  leagues: {
    id: string;
    name: string;
    role: string;
  }[];
};

type ProfileRow = {
  id: string;
  name: string | null;
  is_admin: boolean | null;
  account_status: AccountStatus | null;
  admin_note: string | null;
  created_at: string;
};

type PredictionRow = {
  user_id: string;
  points: number | null;
};

type LeagueMemberRow = {
  user_id: string;
  role: string;
  leagues:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(
      `
      id,
      name,
      is_admin,
      account_status,
      admin_note,
      created_at
    `
    )
    .order('created_at', { ascending: true });

  if (profilesError) {
    throw profilesError;
  }

  const profileRows = (profiles ?? []) as ProfileRow[];
  const userIds = profileRows.map((profile) => profile.id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select(
      `
      user_id,
      points
    `
    )
    .in('user_id', userIds);

  if (predictionsError) {
    throw predictionsError;
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from('league_members')
    .select(
      `
      user_id,
      role,
      leagues (
        id,
        name
      )
    `
    )
    .in('user_id', userIds);

  if (membershipsError) {
    throw membershipsError;
  }

  const predictionStats = new Map<
    string,
    {
      totalPredictions: number;
      totalPoints: number;
    }
  >();

  for (const prediction of (predictions ?? []) as PredictionRow[]) {
    const current = predictionStats.get(prediction.user_id) ?? {
      totalPredictions: 0,
      totalPoints: 0,
    };

    current.totalPredictions += 1;
    current.totalPoints += prediction.points ?? 0;

    predictionStats.set(prediction.user_id, current);
  }

  const leaguesByUser = new Map<
    string,
    {
      id: string;
      name: string;
      role: string;
    }[]
  >();

  for (const membership of (memberships ?? []) as LeagueMemberRow[]) {
    const league = Array.isArray(membership.leagues)
      ? membership.leagues[0]
      : membership.leagues;

    if (!league) continue;

    const current = leaguesByUser.get(membership.user_id) ?? [];

    current.push({
      id: league.id,
      name: league.name,
      role: membership.role,
    });

    leaguesByUser.set(membership.user_id, current);
  }

  return profileRows.map((profile) => {
    const stats = predictionStats.get(profile.id) ?? {
      totalPredictions: 0,
      totalPoints: 0,
    };

    return {
      id: profile.id,
      name: profile.name || 'Utilizador',
      isAdmin: Boolean(profile.is_admin),
      accountStatus: profile.account_status ?? 'active',
      adminNote: profile.admin_note ?? undefined,
      createdAt: profile.created_at,
      totalPredictions: stats.totalPredictions,
      totalPoints: stats.totalPoints,
      leagues: leaguesByUser.get(profile.id) ?? [],
    };
  });
}

export async function updateUserAdminStatus(params: {
  userId: string;
  isAdmin: boolean;
}) {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_admin: params.isAdmin,
    })
    .eq('id', params.userId);

  if (error) {
    throw error;
  }
}

export async function updateUserAccountStatus(params: {
  userId: string;
  status: AccountStatus;
  note?: string;
}) {
  const now = new Date().toISOString();

  const updatePayload: Record<string, string | boolean | null> = {
    account_status: params.status,
    admin_note: params.note?.trim() || null,
  };

  if (params.status === 'active') {
    updatePayload.disabled_at = null;
    updatePayload.blocked_at = null;
    updatePayload.deleted_at = null;
  }

  if (params.status === 'disabled') {
    updatePayload.disabled_at = now;
    updatePayload.blocked_at = null;
    updatePayload.deleted_at = null;
  }

  if (params.status === 'blocked') {
    updatePayload.blocked_at = now;
    updatePayload.disabled_at = null;
    updatePayload.deleted_at = null;
  }

  if (params.status === 'deleted') {
    updatePayload.deleted_at = now;
    updatePayload.disabled_at = null;
    updatePayload.blocked_at = null;
    updatePayload.name = 'Utilizador removido';
    updatePayload.avatar_url = null;
    updatePayload.is_admin = false;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', params.userId);

  if (error) {
    throw error;
  }

  if (params.status === 'deleted') {
    const { error: membershipError } = await supabase
      .from('league_members')
      .delete()
      .eq('user_id', params.userId);

    if (membershipError) {
      throw membershipError;
    }
  }
}