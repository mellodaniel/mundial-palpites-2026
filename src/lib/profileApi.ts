import type { AccountStatus, Profile } from '../types';
import { supabase } from './supabase';

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  timezone: string | null;
  account_status: AccountStatus | null;
};

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      name,
      avatar_url,
      is_admin,
      timezone,
      account_status
    `
    )
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRowToProfile(data as ProfileRow);
}

export async function updateProfileTimezone(params: {
  userId: string;
  timezone: string;
}): Promise<Profile> {
  const cleanTimezone = params.timezone.trim() || 'Europe/Lisbon';

  const { data, error } = await supabase
    .from('profiles')
    .update({
      timezone: cleanTimezone,
    })
    .eq('id', params.userId)
    .select(
      `
      id,
      name,
      avatar_url,
      is_admin,
      timezone,
      account_status
    `
    )
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRowToProfile(data as ProfileRow);
}

function mapProfileRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name || 'Utilizador',
    avatarUrl: row.avatar_url ?? undefined,
    isAdmin: Boolean(row.is_admin),
    timezone: row.timezone || 'Europe/Lisbon',
    accountStatus: row.account_status ?? 'active',
  };
}