import { useMemo, useState } from 'react';
import { CalendarDays, Layers } from 'lucide-react';
import { GroupsInfoAccordion } from '../components/GroupsInfoAccordion';
import { MatchesAccordion } from '../components/MatchesAccordion';
import { useMatches } from '../lib/useMatches';
import { usePredictions } from '../lib/usePredictions';
import { useProfile } from '../lib/useProfile';

type ViewMode = 'group' | 'day';

const GROUP_ORDER = [
  'Grupo A',
  'Grupo B',
  'Grupo C',
  'Grupo D',
  'Grupo E',
  'Grupo F',
  'Grupo G',
  'Grupo H',
  'Grupo I',
  'Grupo J',
  'Grupo K',
  'Grupo L',
];

const STAGE_ORDER = [
  'Ronda de 32',
  'Ronda de 16',
  'Quartos de Final',
  'Meia-final',
  '3.º lugar',
  'Final',
];

export function Matches() {
  const { profile } = useProfile();
  const { matches, isLoadingMatches, matchesError } = useMatches();
  const {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
  } = usePredictions();

  const [viewMode, setViewMode] = useState<ViewMode>('group');
  const [openAllKey, setOpenAllKey] = useState(0);
  const [closeAllKey, setCloseAllKey] = useState(0);

  const timezone = profile?.timezone ?? 'Europe/Lisbon';

  async function handleSavePrediction(params: {
    matchId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }) {
    await savePrediction(params);
  }

  const matchesByGroup = useMemo(() => {
    const grouped = new Map<string, typeof matches>();

    for (const match of matches) {
      const key = match.groupName || match.stage || 'Outros jogos';
      const current = grouped.get(key) ?? [];

      current.push(match);
      grouped.set(key, current);
    }

    return Array.from(grouped.entries()).sort(([groupA], [groupB]) => {
      const indexA = getGroupSortIndex(groupA);
      const indexB = getGroupSortIndex(groupB);

      if (indexA !== indexB) {
        return indexA - indexB;
      }

      return groupA.localeCompare(groupB);
    });
  }, [matches]);

  const matchesByDay = useMemo(() => {
    const grouped = new Map<string, typeof matches>();

    for (const match of matches) {
      const dayKey = getLocalDayKey(match.kickoffUtc, timezone);
      const current = grouped.get(dayKey) ?? [];

      current.push(match);
      grouped.set(dayKey, current);
    }

    return Array.from(grouped.entries()).sort(([dayA], [dayB]) =>
      dayA.localeCompare(dayB)
    );
  }, [matches, timezone]);

  const isLoading = isLoadingMatches || isLoadingPredictions;
  const errorMessage = matchesError || predictionsError;

  function handleOpenAll() {
    setOpenAllKey((current) => current + 1);
  }

  function handleCloseAll() {
    setCloseAllKey((current) => current + 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Jogos</h2>
        <p className="text-sm text-slate-400">
          Calendário no teu horário local:{' '}
          <span className="font-bold text-slate-300">{timezone}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setViewMode('group')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
            viewMode === 'group'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-white/10 text-slate-300 hover:bg-white/15'
          }`}
        >
          <Layers size={16} />
          Por grupo
        </button>

        <button
          type="button"
          onClick={() => setViewMode('day')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
            viewMode === 'day'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-white/10 text-slate-300 hover:bg-white/15'
          }`}
        >
          <CalendarDays size={16} />
          Por dia
        </button>
      </div>

      <GroupsInfoAccordion matches={matches} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpenAll}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
        >
          Abrir todos
        </button>

        <button
          type="button"
          onClick={handleCloseAll}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
        >
          Fechar todos
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          A carregar jogos...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && matches.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          Ainda não existem jogos carregados.
        </div>
      )}

      {!isLoading && !errorMessage && matches.length > 0 && (
        <div className="space-y-3">
          {viewMode === 'group' &&
            matchesByGroup.map(([groupName, groupMatches], index) => (
              <MatchesAccordion
                key={`${groupName}-${openAllKey}-${closeAllKey}`}
                title={groupName}
                description={`${groupMatches.length} jogo(s)`}
                matches={groupMatches}
                timezone={timezone}
                predictions={predictions}
                onSavePrediction={handleSavePrediction}
                defaultOpen={openAllKey > closeAllKey || index === 0}
              />
            ))}

          {viewMode === 'day' &&
            matchesByDay.map(([dayKey, dayMatches], index) => (
              <MatchesAccordion
                key={`${dayKey}-${openAllKey}-${closeAllKey}`}
                title={formatLocalDayTitle(dayKey, timezone)}
                description={`${dayMatches.length} jogo(s) · ${timezone}`}
                matches={dayMatches}
                timezone={timezone}
                predictions={predictions}
                onSavePrediction={handleSavePrediction}
                defaultOpen={openAllKey > closeAllKey || index === 0}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function getGroupSortIndex(groupName: string) {
  const groupIndex = GROUP_ORDER.indexOf(groupName);

  if (groupIndex >= 0) {
    return groupIndex;
  }

  const stageIndex = STAGE_ORDER.indexOf(groupName);

  if (stageIndex >= 0) {
    return GROUP_ORDER.length + stageIndex;
  }

  return GROUP_ORDER.length + STAGE_ORDER.length + 1;
}

function getLocalDayKey(kickoffUtc: string, timezone: string) {
  const date = new Date(kickoffUtc);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '2026';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

function formatLocalDayTitle(dayKey: string, timezone: string) {
  const [year, month, day] = dayKey.split('-').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(date);
}