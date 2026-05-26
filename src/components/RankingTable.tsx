import { Medal, Trophy } from 'lucide-react';
import type { RankingRow } from '../types';

type Props = {
  rows: RankingRow[];
};

export function RankingTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 px-4 py-4">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Trophy size={20} className="text-emerald-300" />
          Classificação geral
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Ordenado por pontos, placares exatos e acertos.
        </p>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-white/10 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3 text-right">Pontos</th>
            <th className="hidden px-4 py-3 text-right sm:table-cell">
              Exatos
            </th>
            <th className="hidden px-4 py-3 text-right sm:table-cell">
              Acertos
            </th>
            <th className="hidden px-4 py-3 text-right md:table-cell">
              Palpites
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row.userId} className="border-t border-white/10">
              <td className="px-4 py-4 font-bold text-emerald-300">
                <div className="flex items-center gap-2">
                  {index < 3 && <MedalIcon position={index + 1} />}
                  <span>{index + 1}</span>
                </div>
              </td>

              <td className="px-4 py-4 font-medium">{row.name}</td>

              <td className="px-4 py-4 text-right text-lg font-black">
                {row.totalPoints}
              </td>

              <td className="hidden px-4 py-4 text-right sm:table-cell">
                {row.exactScores}
              </td>

              <td className="hidden px-4 py-4 text-right sm:table-cell">
                {row.correctOutcomes}
              </td>

              <td className="hidden px-4 py-4 text-right md:table-cell">
                {row.totalPredictions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MedalIcon({ position }: { position: number }) {
  const className =
    position === 1
      ? 'text-yellow-300'
      : position === 2
      ? 'text-slate-300'
      : 'text-amber-600';

  return <Medal size={18} className={className} />;
}