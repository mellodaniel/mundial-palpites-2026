import { useMemo, useState } from 'react';
import { CalendarDays, Layers } from 'lucide-react';
import { MatchesAccordion } from '../components/MatchesAccordion';
import { groupMatchesByDay, groupMatchesByGroup } from '../lib/groupMatches';
import { useMatches } from '../lib/useMatches';
import { usePredictions } from '../lib/usePredictions';
import { useProfile } from '../lib/useProfile';

type ViewMode = 'group' | 'day';

export function Matches() {
  const [viewMode, setViewMode] = useState<ViewMode>('group');

  const { profile } = useProfile();
  const { matches, isLoadingMatches, matchesError } = useMatches();
  const {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
  } = usePredictions();

  const timezone = profile?.timezone ?? 'Europe/Lisbon';

  const groups = useMemo(() => {
    if (viewMode === 'group') {
      return groupMatchesByGroup(matches);
    }

    return groupMatchesByDay(matches, timezone);
  }, [matches, timezone, viewMode]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Jogos</h2>
        <p className="text-sm text-slate-400">
          Calendário no teu horário local: <strong>{timezone}</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1 sm:inline-grid">
        <button
          type="button"
          onClick={() => setViewMode('group')}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            viewMode === 'group'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <Layers size={18} />
          Por grupo
        </button>

        <button
          type="button"
          onClick={() => setViewMode('day')}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            viewMode === 'day'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <CalendarDays size={18} />
          Por dia
        </button>
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
        groups.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
            Ainda não existem jogos carregados.
          </div>
        )}

      {!isLoadingMatches &&
        !isLoadingPredictions &&
        !matchesError &&
        !predictionsError &&
        groups.length > 0 && (
          <MatchesAccordion
            groups={groups}
            predictions={predictions}
            timezone={timezone}
            onSavePrediction={savePrediction}
          />
        )}
    </div>
  );
}