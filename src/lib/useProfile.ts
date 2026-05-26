import { useEffect, useState } from 'react';
import type { Profile } from '../types';
import { useAuth } from './useAuth';
import { getProfile, updateProfileTimezone } from './profileApi';

export function useProfile() {
  const { user, isLoadingAuth } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  async function loadProfile() {
    if (!user) {
      setProfile(null);
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError('');

      const profileFromApi = await getProfile(user.id);

      setProfile(profileFromApi);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar perfil.';

      setProfileError(message);
    } finally {
      setIsLoadingProfile(false);
    }
  }

  useEffect(() => {
    if (isLoadingAuth) return;

    loadProfile();
  }, [user, isLoadingAuth]);

  async function saveTimezone(timezone: string) {
    if (!user) {
      throw new Error('Tens de estar autenticado para atualizar o perfil.');
    }

    const updatedProfile = await updateProfileTimezone({
      userId: user.id,
      timezone,
    });

    setProfile(updatedProfile);

    return updatedProfile;
  }

  return {
    profile,
    isLoadingProfile,
    profileError,
    saveTimezone,
    reloadProfile: loadProfile,
  };
}