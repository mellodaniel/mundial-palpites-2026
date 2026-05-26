import { useEffect, useState } from 'react';
import type { AccountStatus, Profile } from '../types';
import { supabase } from './supabase';
import { useAuth } from './useAuth';

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  timezone: string | null;
  account_status: AccountStatus | null;
};

export function useProfile() {
  const { user, isLoadingAuth } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (isLoadingAuth) return;

      if (!user) {
        setProfile(null);
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        setProfileError('');

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
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        setProfile(mapProfileRowToProfile(data as ProfileRow));
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : 'Erro ao carregar perfil.';

        setProfileError(message);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user, isLoadingAuth]);

  return {
    profile,
    isLoadingProfile,
    profileError,
  };
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