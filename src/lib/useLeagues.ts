import { useEffect, useState } from 'react';
import type { League } from '../types';
import { useAuth } from './useAuth';
import {
  createLeague,
  getMyLeagues,
  joinLeagueByInviteCode,
  leaveLeague,
} from './leaguesApi';

export function useLeagues() {
  const { user, isLoadingAuth } = useAuth();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);
  const [leaguesError, setLeaguesError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadLeagues() {
      if (isLoadingAuth) return;

      if (!user) {
        setLeagues([]);
        setIsLoadingLeagues(false);
        return;
      }

      try {
        setIsLoadingLeagues(true);
        setLeaguesError('');

        const leaguesFromApi = await getMyLeagues(user.id);

        if (!isMounted) return;

        setLeagues(leaguesFromApi);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : 'Erro ao carregar ligas.';

        setLeaguesError(message);
      } finally {
        if (isMounted) {
          setIsLoadingLeagues(false);
        }
      }
    }

    loadLeagues();

    return () => {
      isMounted = false;
    };
  }, [user, isLoadingAuth]);

  async function addLeague(name: string) {
    if (!user) {
      throw new Error('Precisas de estar autenticado.');
    }

    const createdLeague = await createLeague({
      userId: user.id,
      name,
    });

    setLeagues((current) => [createdLeague, ...current]);

    return createdLeague;
  }

  async function joinLeague(inviteCode: string) {
    if (!user) {
      throw new Error('Precisas de estar autenticado.');
    }

    const joinedLeague = await joinLeagueByInviteCode({
      userId: user.id,
      inviteCode,
    });

    setLeagues((current) => {
      const exists = current.some((league) => league.id === joinedLeague.id);

      if (exists) {
        return current.map((league) =>
          league.id === joinedLeague.id ? joinedLeague : league
        );
      }

      return [joinedLeague, ...current];
    });

    return joinedLeague;
  }

  async function removeLeague(leagueId: string) {
    if (!user) {
      throw new Error('Precisas de estar autenticado.');
    }

    await leaveLeague({
      userId: user.id,
      leagueId,
    });

    setLeagues((current) =>
      current.filter((league) => league.id !== leagueId)
    );
  }

  return {
    leagues,
    isLoadingLeagues,
    leaguesError,
    addLeague,
    joinLeague,
    removeLeague,
  };
}