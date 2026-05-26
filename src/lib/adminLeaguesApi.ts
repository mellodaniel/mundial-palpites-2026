import { supabase } from './supabase';

export type AdminLeagueMember = {
  id: string;
  userId: string;
  name: string;
  role: string;
  isAdmin: boolean;
  accountStatus: string;
  joinedAt: string;
};

export type AdminLeagueRow = {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  members: AdminLeagueMember[];
};

type LeagueRow = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

type LeagueMemberRow = {
  id: string;
  league_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  is_admin: boolean | null;
  account_status: string | null;
};

export async function getAdminLeagues(): Promise<AdminLeagueRow[]> {
  const { data: leagues, error: leaguesError } = await supabase
    .from('leagues')
    .select(
      `
      id,
      name,
      invite_code,
      created_by,
      created_at
    `
    )
    .order('created_at', { ascending: true });

  if (leaguesError) {
    throw leaguesError;
  }

  const leagueRows = (leagues ?? []) as LeagueRow[];

  if (leagueRows.length === 0) {
    return [];
  }

  const leagueIds = leagueRows.map((league) => league.id);

  const { data: members, error: membersError } = await supabase
    .from('league_members')
    .select(
      `
      id,
      league_id,
      user_id,
      role,
      created_at
    `
    )
    .in('league_id', leagueIds)
    .order('created_at', { ascending: true });

  if (membersError) {
    throw membersError;
  }

  const memberRows = (members ?? []) as LeagueMemberRow[];
  const userIds = Array.from(new Set(memberRows.map((member) => member.user_id)));

  let profileRows: ProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(
        `
        id,
        name,
        is_admin,
        account_status
      `
      )
      .in('id', userIds);

    if (profilesError) {
      throw profilesError;
    }

    profileRows = (profiles ?? []) as ProfileRow[];
  }

  const profilesMap = new Map(profileRows.map((profile) => [profile.id, profile]));

  const membersByLeague = new Map<string, AdminLeagueMember[]>();

  for (const member of memberRows) {
    const profile = profilesMap.get(member.user_id);

    const current = membersByLeague.get(member.league_id) ?? [];

    current.push({
      id: member.id,
      userId: member.user_id,
      name: profile?.name || 'Utilizador',
      role: member.role,
      isAdmin: Boolean(profile?.is_admin),
      accountStatus: profile?.account_status || 'active',
      joinedAt: member.created_at,
    });

    membersByLeague.set(member.league_id, current);
  }

  return leagueRows.map((league) => ({
    id: league.id,
    name: league.name,
    inviteCode: league.invite_code,
    createdBy: league.created_by,
    createdAt: league.created_at,
    members: membersByLeague.get(league.id) ?? [],
  }));
}

export async function updateLeagueName(params: {
  leagueId: string;
  name: string;
}) {
  const cleanName = params.name.trim();

  if (!cleanName) {
    throw new Error('Indica o nome da liga.');
  }

  const { error } = await supabase
    .from('leagues')
    .update({
      name: cleanName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.leagueId);

  if (error) {
    throw error;
  }
}

export async function removeLeagueMember(params: {
  membershipId: string;
}) {
  const { error } = await supabase
    .from('league_members')
    .delete()
    .eq('id', params.membershipId);

  if (error) {
    throw error;
  }
}

export async function deleteLeague(params: {
  leagueId: string;
}) {
  const { error } = await supabase
    .from('leagues')
    .delete()
    .eq('id', params.leagueId);

  if (error) {
    throw error;
  }
}