import { useEffect, useState } from 'react';
import type { Prediction } from '../types';
import { getMyPredictions, upsertMyPrediction } from './predictionsApi';
import { useAuth } from './useAuth';

export function usePredictions() {
  const { user, isLoadingAuth } = useAuth();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [predictionsError, setPredictionsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadPredictions() {
      if (isLoadingAuth) return;

      if (!user) {
        setPredictions([]);
        setIsLoadingPredictions(false);
        return;
      }

      try {
        setIsLoadingPredictions(true);
        setPredictionsError('');

        const predictionsFromApi = await getMyPredictions(user.id);

        if (!isMounted) return;

        setPredictions(predictionsFromApi);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao carregar palpites.';

        setPredictionsError(message);
      } finally {
        if (isMounted) {
          setIsLoadingPredictions(false);
        }
      }
    }

    loadPredictions();

    return () => {
      isMounted = false;
    };
  }, [user, isLoadingAuth]);

  async function savePrediction(
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ) {
    if (!user) {
      throw new Error('Precisas de estar autenticado para guardar palpites.');
    }

    const savedPrediction = await upsertMyPrediction({
      userId: user.id,
      matchId,
      predictedHomeScore,
      predictedAwayScore,
    });

    setPredictions((currentPredictions) => {
      const exists = currentPredictions.some(
        (prediction) => prediction.matchId === matchId
      );

      if (exists) {
        return currentPredictions.map((prediction) =>
          prediction.matchId === matchId ? savedPrediction : prediction
        );
      }

      return [...currentPredictions, savedPrediction];
    });

    return savedPrediction;
  }

  return {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
  };
}