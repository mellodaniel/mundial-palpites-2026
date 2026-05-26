import { useEffect, useState } from 'react';
import type { RankingRow } from '../types';
import { getRanking } from './rankingApi';

export function useRanking() {
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);
  const [rankingError, setRankingError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRanking() {
      try {
        setIsLoadingRanking(true);
        setRankingError('');

        const rankingFromApi = await getRanking();

        if (!isMounted) return;

        setRanking(rankingFromApi);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : 'Erro ao carregar ranking.';

        setRankingError(message);
      } finally {
        if (isMounted) {
          setIsLoadingRanking(false);
        }
      }
    }

    loadRanking();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ranking,
    isLoadingRanking,
    rankingError,
  };
}