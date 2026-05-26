import { useState } from 'react';
import type { Match, Prediction } from '../types';

type Props = {
  match: Match;
  currentPrediction?: Prediction;
  onSave: (
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ) => Promise<void> | void;
  onCancel: () => void;
};

export function PredictionForm({
  match,
  currentPrediction,
  onSave,
  onCancel,
}: Props) {
  const [homeScore, setHomeScore] = useState(
    currentPrediction?.predictedHomeScore?.toString() ?? ''
  );
  const [awayScore, setAwayScore] = useState(
    currentPrediction?.predictedAwayScore?.toString() ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const predictedHomeScore = Number(homeScore);
    const predictedAwayScore = Number(awayScore);

    if (
      homeScore === '' ||
      awayScore === '' ||
      Number.isNaN(predictedHomeScore) ||
      Number.isNaN(predictedAwayScore) ||
      predictedHomeScore < 0 ||
      predictedAwayScore < 0
    ) {
      setErrorMessage('Insere um resultado válido para as duas equipas.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      await onSave(match.id, predictedHomeScore, predictedAwayScore);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao guardar o palpite.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4"
    >
      <p className="mb-4 text-sm font-semibold text-emerald-300">
        O teu palpite
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            {match.homeTeam}
          </label>
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-center text-xl font-bold text-white outline-none focus:border-emerald-400"
            placeholder="0"
          />
        </div>

        <div className="pt-7 text-sm font-bold text-slate-400">x</div>

        <div>
          <label className="mb-2 block text-right text-sm font-medium text-slate-300">
            {match.awayTeam}
          </label>
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-center text-xl font-bold text-white outline-none focus:border-emerald-400"
            placeholder="0"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isSaving ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}