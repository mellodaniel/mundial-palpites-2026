import { useEffect, useState } from 'react';
import type { Prediction } from '../types';
import { supabase } from './supabase';
import { useAuth } from './useAuth';

type PredictionRow = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points: number | null;
  exact_score: boolean | null;
  correct_outcome: boolean | null;
};

type SavePredictionParams = {
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
};

export function usePredictions() {
  const { user, isLoadingAuth } = useAuth();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [predictionsError, setPredictionsError] = useState('');

  async function loadPredictions() {
    if (!user) {
      setPredictions([]);
      setIsLoadingPredictions(false);
      return;
    }

    try {
      setIsLoadingPredictions(true);
      setPredictionsError('');

      const { data, error } = await supabase
        .from('predictions')
        .select(
          `
          id,
          user_id,
          match_id,
          predicted_home_score,
          predicted_away_score,
          points,
          exact_score,
          correct_outcome
        `
        )
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setPredictions(((data ?? []) as PredictionRow[]).map(mapPredictionRow));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar palpites.';

      setPredictionsError(message);
    } finally {
      setIsLoadingPredictions(false);
    }
  }

  useEffect(() => {
    if (isLoadingAuth) return;

    loadPredictions();
  }, [user, isLoadingAuth]);

  async function savePrediction(
    paramsOrMatchId: SavePredictionParams | string,
    legacyPredictedHomeScore?: number,
    legacyPredictedAwayScore?: number
  ) {
    if (!user) {
      throw new Error('Tens de estar autenticado para guardar palpites.');
    }

    const params =
      typeof paramsOrMatchId === 'string'
        ? {
            matchId: paramsOrMatchId,
            predictedHomeScore: Number(legacyPredictedHomeScore),
            predictedAwayScore: Number(legacyPredictedAwayScore),
          }
        : paramsOrMatchId;

    const matchId = params.matchId;
    const predictedHomeScore = Number(params.predictedHomeScore);
    const predictedAwayScore = Number(params.predictedAwayScore);

    if (!matchId || typeof matchId !== 'string') {
      throw new Error('Jogo inválido.');
    }

    if (
      Number.isNaN(predictedHomeScore) ||
      Number.isNaN(predictedAwayScore) ||
      predictedHomeScore < 0 ||
      predictedAwayScore < 0
    ) {
      throw new Error('Palpite inválido.');
    }

    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          predicted_home_score: predictedHomeScore,
          predicted_away_score: predictedAwayScore,
          points: 0,
          exact_score: false,
          correct_outcome: false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,match_id',
        }
      )
      .select(
        `
        id,
        user_id,
        match_id,
        predicted_home_score,
        predicted_away_score,
        points,
        exact_score,
        correct_outcome
      `
      )
      .single();

    if (error) {
      throw error;
    }

    const savedPrediction = mapPredictionRow(data as PredictionRow);

    setPredictions((current) => {
      const exists = current.some(
        (prediction) => prediction.matchId === savedPrediction.matchId
      );

      if (!exists) {
        return [...current, savedPrediction];
      }

      return current.map((prediction) =>
        prediction.matchId === savedPrediction.matchId
          ? savedPrediction
          : prediction
      );
    });

    return savedPrediction;
  }

  return {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
    reloadPredictions: loadPredictions,
  };
}

function mapPredictionRow(row: PredictionRow): Prediction {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    predictedHomeScore: row.predicted_home_score,
    predictedAwayScore: row.predicted_away_score,
    points: row.points ?? 0,
    exactScore: Boolean(row.exact_score),
    correctOutcome: Boolean(row.correct_outcome),
  };
}