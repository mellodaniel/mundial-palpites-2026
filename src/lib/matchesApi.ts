import { supabase } from './supabase';
import type { Match } from '../types';

type MatchRow = {
  id: string;
  external_id: string | null;
  match_number: number | null;
  stage: string;
  group_name: string | null;
  home_team: string | null;
  away_team: string | null;
  home_team_code: string | null;
  away_team_code: string | null;
  stadium: string | null;
  city: string | null;
  country: string | null;
  kickoff_utc: string;
  status: Match['status'];
  home_score: number | null;
  away_score: number | null;
};

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      id,
      external_id,
      match_number,
      stage,
      group_name,
      home_team,
      away_team,
      home_team_code,
      away_team_code,
      stadium,
      city,
      country,
      kickoff_utc,
      status,
      home_score,
      away_score
    `
    )
    .order('kickoff_utc', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMatchRowToMatch);
}

export function mapMatchRowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    externalId: row.external_id ?? undefined,
    matchNumber: row.match_number ?? 0,
    stage: row.stage,
    groupName: row.group_name ?? undefined,
    homeTeam: row.home_team ?? 'A definir',
    awayTeam: row.away_team ?? 'A definir',
    homeTeamCode: row.home_team_code ?? undefined,
    awayTeamCode: row.away_team_code ?? undefined,
    stadium: row.stadium ?? 'Estádio a definir',
    city: row.city ?? 'Cidade a definir',
    country: row.country ?? '',
    kickoffUtc: row.kickoff_utc,
    status: row.status,
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
  };
}