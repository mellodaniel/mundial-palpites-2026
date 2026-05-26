import { useMemo, useState } from 'react';
import { BarChart3, Medal, Trophy } from 'lucide-react';
import type { RankingRow } from '../types';
import { useLeagues } from '../lib/useLeagues';
import { useRanking } from '../lib/useRanking';

type RankingScope = 'global' | string;

export function Ranking() {
  const { leagues, isLoadingLeagues, leaguesError } = useLeagues();

  const [selectedScope, setSelectedScope] = useState<RankingScope>('global');

  const selectedLeagueId =
    selectedScope === 'global' ? undefined : selectedScope;

  const { ranking, isLoadingRanking, rankingError } =
    useRanking(selectedLeagueId);

  const selectedLeague = useMemo(
    () => leagues.find((league) => league.id === selectedLeagueId),
    [leagues, selectedLeagueId]
  );

  const title =
    selectedScope === 'global'
      ? 'Ranking Global'
      : `Ranking — ${selectedLeague?.name ?? 'Liga'}`;

  const description =
    selectedScope === 'global'
      ? 'Classificação geral com todos os participantes.'
      : 'Classificação apenas com os membros desta liga.';

  const isLoading = isLoadingRanking || isLoadingLeagues;
  const errorMessage = rankingError || leaguesError;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Ranking</h2>
        <p className="text-sm text-slate-400">
          Consulta o ranking global ou filtra por uma das tuas ligas privadas.
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <BarChart3 size={20} />
          </div>

          <div>
            <h3 className="font-bold">Escolher ranking</h3>
            <p className="text-sm text-slate-400">
              O mesmo palpite conta para o ranking global e para todas as ligas
              onde o utilizador está inscrito.
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Ranking
        </label>

        <select
          value={selectedScope}
          onChange={(event) => setSelectedScope(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
        >
          <option value="global">Ranking Global</option>

          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>

        {!isLoadingLeagues && leagues.length === 0 && (
          <p className="mt-3 text-sm text-amber-300">
            Ainda não estás em nenhuma liga privada. Podes entrar numa liga no
            menu Ligas.
          </p>
        )}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-6 text-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide">
          {selectedScope === 'global' ? 'Classificação geral' : 'Liga privada'}
        </p>
        <h3 className="mt-2 text-3xl font-black">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm font-medium text-slate-800">
          {description}
        </p>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          A carregar ranking...
        </div>
      )}

      {!isLoading && !errorMessage && ranking.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          Ainda não existem participantes neste ranking.
        </div>
      )}

      {!isLoading && !errorMessage && ranking.length > 0 && (
        <div className="space-y-3">
          {ranking.map((row, index) => (
            <RankingCard
              key={row.userId}
              row={row}
              position={index + 1}
              isPodium={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RankingCard({
  row,
  position,
  isPodium,
}: {
  row: RankingRow;
  position: number;
  isPodium: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        isPodium
          ? 'border-emerald-400/30 bg-emerald-400/10'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PositionBadge position={position} />

          <div>
            <h3 className="text-lg font-black">{row.name}</h3>
            <p className="text-sm text-slate-400">
              {row.totalPredictions} palpite(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-right">
          <RankingStat label="Pontos" value={String(row.totalPoints)} />
          <RankingStat label="Exatos" value={String(row.exactScores)} />
          <RankingStat label="Acertos" value={String(row.correctOutcomes)} />
        </div>
      </div>
    </article>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
        <Trophy size={24} />
      </div>
    );
  }

  if (position === 2) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-300 text-slate-950">
        <Medal size={24} />
      </div>
    );
  }

  if (position === 3) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400 text-slate-950">
        <Medal size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-slate-300">
      {position}
    </div>
  );
}

function RankingStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}