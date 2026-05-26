import { MatchCard } from '../components/MatchCard';
import { useMatches } from '../lib/useMatches';
import { usePredictions } from '../lib/usePredictions';

export function Matches() {
  const { matches, isLoadingMatches, matchesError } = useMatches();
  const {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
  } = usePredictions();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Jogos</h2>
        <p className="text-sm text-slate-400">
          Calendário do Mundial em horário de Portugal.
        </p>
      </div>

      {(isLoadingMatches || isLoadingPredictions) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          A carregar jogos e palpites...
        </div>
      )}

      {(matchesError || predictionsError) && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {matchesError || predictionsError}
        </div>
      )}

      {!isLoadingMatches &&
        !isLoadingPredictions &&
        !matchesError &&
        !predictionsError &&
        matches.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
            Ainda não existem jogos carregados.
          </div>
        )}

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={predictions.find(
              (prediction) => prediction.matchId === match.id
            )}
            onSavePrediction={savePrediction}
          />
        ))}
      </div>
    </div>
  );
}