import { useEffect, useState } from 'react';
import type { Profile } from '../types';
import { useAuth } from './useAuth';
import { getProfile, updateProfileTimezone } from './profileApi';

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

        const profileFromApi = await getProfile(user.id);

        if (!isMounted) return;

        setProfile(profileFromApi);
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

  async function saveTimezone(timezone: string) {
    if (!user) {
      throw new Error('Precisas de estar autenticado.');
    }

    const updatedProfile = await updateProfileTimezone(user.id, timezone);
    setProfile(updatedProfile);

    return updatedProfile;
  }

  return {
    profile,
    isLoadingProfile,
    profileError,
    saveTimezone,
  };
}