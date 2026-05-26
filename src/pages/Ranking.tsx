import { RankingTable } from '../components/RankingTable';
import { useRanking } from '../lib/useRanking';

export function Ranking() {
  const { ranking, isLoadingRanking, rankingError } = useRanking();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Ranking</h2>
        <p className="text-sm text-slate-400">
          Classificação geral dos participantes.
        </p>
      </div>

      {isLoadingRanking && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          A carregar ranking...
        </div>
      )}

      {rankingError && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {rankingError}
        </div>
      )}

      {!isLoadingRanking && !rankingError && ranking.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          Ainda não existem participantes no ranking.
        </div>
      )}

      {!isLoadingRanking && !rankingError && ranking.length > 0 && (
        <RankingTable rows={ranking} />
      )}
    </div>
  );
}