import { CalendarDays, Trophy, Target, Users } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';
import { useMatches } from '../lib/useMatches';
import { usePredictions } from '../lib/usePredictions';

export function Dashboard() {
  const { matches, isLoadingMatches, matchesError } = useMatches();
  const {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
  } = usePredictions();

  const nextMatches = matches.slice(0, 2);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-6 text-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide">
          Mundial Palpites 2026
        </p>
        <h2 className="mt-2 text-3xl font-black">
          Faz os teus palpites e compete com os amigos
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-medium text-slate-800">
          Dá palpites antes dos jogos, acompanha os resultados e sobe no ranking
          à medida que fores acertando.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Trophy />} label="A tua posição" value="-" />
        <StatCard icon={<Target />} label="Pontos" value="0" />
        <StatCard
          icon={<CalendarDays />}
          label="Jogos por palpitar"
          value={String(Math.max(matches.length - predictions.length, 0))}
        />
        <StatCard icon={<Users />} label="Liga" value="Global" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">Próximos jogos</h3>
          <a href="/jogos" className="text-sm font-medium text-emerald-300">
            Ver todos
          </a>
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
          nextMatches.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
              Ainda não existem jogos carregados.
            </div>
          )}

        <div className="grid gap-4 md:grid-cols-2">
          {nextMatches.map((match) => (
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
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-emerald-300">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}