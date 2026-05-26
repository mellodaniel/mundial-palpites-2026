import { useEffect, useState } from 'react';
import type { Match } from '../types';
import { getMatches } from './matchesApi';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      try {
        setIsLoadingMatches(true);
        setMatchesError('');

        const matchesFromApi = await getMatches();

        if (!isMounted) return;

        setMatches(matchesFromApi);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : 'Erro ao carregar jogos.';

        setMatchesError(message);
      } finally {
        if (isMounted) {
          setIsLoadingMatches(false);
        }
      }
    }

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    matches,
    isLoadingMatches,
    matchesError,
  };
}