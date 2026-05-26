import { supabase } from './supabase';
import type { Profile } from '../types';

type ProfileRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean | null;
  timezone: string | null;
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
      timezone
    `
    )
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRowToProfile(data);
}

export async function updateProfileTimezone(
  userId: string,
  timezone: string
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      timezone,
    })
    .eq('id', userId)
    .select(
      `
      id,
      name,
      avatar_url,
      is_admin,
      timezone
    `
    )
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRowToProfile(data);
}

function mapProfileRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url ?? undefined,
    isAdmin: row.is_admin ?? false,
    timezone: row.timezone ?? 'Europe/Lisbon',
  };
}