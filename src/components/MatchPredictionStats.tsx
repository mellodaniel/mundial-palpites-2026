import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  getMatchPredictionStats,
  type MatchPredictionStats as MatchPredictionStatsType,
} from '../lib/predictionStatsApi';

export function MatchPredictionStats({
  matchId,
  homeTeam,
  awayTeam,
  refreshKey,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  refreshKey?: number;
}) {
  const [stats, setStats] = useState<MatchPredictionStatsType | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setIsLoadingStats(true);
        setStatsError('');

        const statsFromApi = await getMatchPredictionStats(matchId);

        if (!isMounted) return;

        setStats(statsFromApi);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao carregar estatísticas.';

        setStatsError(message);
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [matchId, refreshKey]);

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <BarChart3 size={16} className="text-emerald-300" />
          <p className="text-xs font-bold uppercase tracking-wide">
            Tendência global dos palpites
          </p>
        </div>

        {stats && (
          <p className="text-xs text-slate-500">{stats.total} palpite(s)</p>
        )}
      </div>

      {isLoadingStats && (
        <p className="text-xs text-slate-500">A atualizar estatísticas...</p>
      )}

      {!isLoadingStats && statsError && (
        <p className="text-xs text-red-300">{statsError}</p>
      )}

      {!isLoadingStats && !statsError && stats && (
        <div className="grid gap-2 text-center text-[11px] sm:grid-cols-3">
          <StatPill
            label={shortTeamName(homeTeam)}
            value={`${stats.homeWinPercent}%`}
          />

          <StatPill label="Empate" value={`${stats.drawPercent}%`} />

          <StatPill
            label={shortTeamName(awayTeam)}
            value={`${stats.awayWinPercent}%`}
          />
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-2">
      <p className="truncate text-slate-400">{label}</p>
      <p className="mt-1 font-black text-emerald-300">{value}</p>
    </div>
  );
}

function shortTeamName(teamName: string) {
  if (teamName.length <= 14) {
    return teamName;
  }

  return `${teamName.slice(0, 13)}…`;
}