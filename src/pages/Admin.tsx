import { useMemo, useState } from 'react';
import { Calculator, RefreshCcw } from 'lucide-react';
import { useMatches } from '../lib/useMatches';
import { finishMatchAndRecalculatePoints, reopenMatch } from '../lib/adminApi';

export function Admin() {
  const { matches, isLoadingMatches, matchesError } = useMatches();

  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedMatchId),
    [matches, selectedMatchId]
  );

  function handleSelectMatch(matchId: string) {
    setSelectedMatchId(matchId);
    setSuccessMessage('');
    setErrorMessage('');

    const match = matches.find((item) => item.id === matchId);

    setHomeScore(match?.homeScore?.toString() ?? '');
    setAwayScore(match?.awayScore?.toString() ?? '');
  }

  async function handleFinishMatch(event: React.FormEvent) {
    event.preventDefault();

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (!selectedMatchId) {
      setErrorMessage('Seleciona um jogo.');
      return;
    }

    if (
      homeScore === '' ||
      awayScore === '' ||
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore) ||
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      setErrorMessage('Insere um resultado válido.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const result = await finishMatchAndRecalculatePoints({
        matchId: selectedMatchId,
        homeScore: parsedHomeScore,
        awayScore: parsedAwayScore,
      });

      setSuccessMessage(
        `Resultado guardado e ${result.updatedPredictions} palpite(s) recalculado(s).`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao guardar resultado.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReopenMatch() {
    if (!selectedMatchId) {
      setErrorMessage('Seleciona um jogo.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await reopenMatch({
        matchId: selectedMatchId,
      });

      setHomeScore('');
      setAwayScore('');
      setSuccessMessage('Jogo reaberto e pontuações limpas.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao reabrir jogo.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Admin</h2>
        <p className="text-sm text-slate-400">
          Área de fallback para inserir resultados e recalcular pontuações.
        </p>
      </div>

      {isLoadingMatches && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          A carregar jogos...
        </div>
      )}

      {matchesError && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {matchesError}
        </div>
      )}

      {!isLoadingMatches && !matchesError && (
        <form
          onSubmit={handleFinishMatch}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="mb-5 flex items-center gap-2">
            <Calculator size={22} className="text-emerald-300" />
            <div>
              <h3 className="text-lg font-bold">Inserir resultado final</h3>
              <p className="text-sm text-slate-400">
                Ao guardar, os pontos dos palpites desse jogo são recalculados.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Jogo
              </label>

              <select
                value={selectedMatchId}
                onChange={(event) => handleSelectMatch(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="">Selecionar jogo</option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    #{match.matchNumber} · {match.homeTeam} x {match.awayTeam}
                  </option>
                ))}
              </select>
            </div>

            {selectedMatch && (
              <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Jogo selecionado</p>
                <p className="mt-1 text-lg font-bold">
                  {selectedMatch.homeTeam} x {selectedMatch.awayTeam}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Estado atual: {selectedMatch.status}
                </p>
              </div>
            )}

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {selectedMatch?.homeTeam ?? 'Casa'}
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
                  {selectedMatch?.awayTeam ?? 'Fora'}
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

            {successMessage && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isSaving ? 'A guardar...' : 'Guardar resultado e recalcular'}
              </button>

              <button
                type="button"
                onClick={handleReopenMatch}
                disabled={isSaving || !selectedMatchId}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw size={18} />
                Reabrir jogo
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}