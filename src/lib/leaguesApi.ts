import { supabase } from './supabase';
import type { League } from '../types';

type LeagueRow = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

type LeagueMemberWithLeagueRow = {
  role: string;
  leagues: LeagueRow | LeagueRow[] | null;
};

export async function getMyLeagues(userId: string): Promise<League[]> {
  const { data, error } = await supabase
    .from('league_members')
    .select(
      `
      role,
      leagues (
        id,
        name,
        invite_code,
        created_by,
        created_at
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as LeagueMemberWithLeagueRow[])
    .map((row) => {
      const league = Array.isArray(row.leagues) ? row.leagues[0] : row.leagues;

      if (!league) {
        return null;
      }

      return mapLeagueRowToLeague(league, row.role);
    })
    .filter((league): league is League => Boolean(league));
}

export async function createLeague(params: {
  userId: string;
  name: string;
}): Promise<League> {
  const cleanName = params.name.trim();

  if (!cleanName) {
    throw new Error('Indica o nome da liga.');
  }

  const inviteCode = generateInviteCode();

  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({
      name: cleanName,
      invite_code: inviteCode,
      created_by: params.userId,
    })
    .select(
      `
      id,
      name,
      invite_code,
      created_by,
      created_at
    `
    )
    .single();

  if (leagueError) {
    throw leagueError;
  }

  const { error: memberError } = await supabase.from('league_members').insert({
    league_id: league.id,
    user_id: params.userId,
    role: 'owner',
  });

  if (memberError) {
    throw memberError;
  }

  return mapLeagueRowToLeague(league, 'owner');
}

export async function joinLeagueByInviteCode(params: {
  userId: string;
  inviteCode: string;
}): Promise<League> {
  const cleanInviteCode = params.inviteCode.trim().toUpperCase();

  if (!cleanInviteCode) {
    throw new Error('Indica o código de convite.');
  }

  const { data: league, error: leagueError } = await supabase
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
    .eq('invite_code', cleanInviteCode)
    .single();

  if (leagueError) {
    throw new Error('Liga não encontrada. Confirma o código de convite.');
  }

  const { error: memberError } = await supabase.from('league_members').upsert(
    {
      league_id: league.id,
      user_id: params.userId,
      role: 'member',
    },
    {
      onConflict: 'league_id,user_id',
    }
  );

  if (memberError) {
    throw memberError;
  }

  return mapLeagueRowToLeague(league, 'member');
}

export async function leaveLeague(params: {
  userId: string;
  leagueId: string;
}) {
  const { error } = await supabase
    .from('league_members')
    .delete()
    .eq('user_id', params.userId)
    .eq('league_id', params.leagueId);

  if (error) {
    throw error;
  }
}

function mapLeagueRowToLeague(row: LeagueRow, myRole?: string): League {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    createdBy: row.created_by,
    createdAt: row.created_at,
    myRole,
  };
}

function generateInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}