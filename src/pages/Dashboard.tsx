import { CalendarDays, Trophy, Target, Users, CheckCircle2 } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';
import { ScoringRulesAccordion } from '../components/ScoringRulesAccordion';
import { useLeagues } from '../lib/useLeagues';
import { useMatches } from '../lib/useMatches';
import { usePredictions } from '../lib/usePredictions';
import { useProfile } from '../lib/useProfile';
import { useRanking } from '../lib/useRanking';

export function Dashboard() {
  const { profile } = useProfile();
  const { leagues, isLoadingLeagues } = useLeagues();
  const { matches, isLoadingMatches, matchesError } = useMatches();
  const {
    predictions,
    isLoadingPredictions,
    predictionsError,
    savePrediction,
  } = usePredictions();
  const { ranking, isLoadingRanking, rankingError } = useRanking();

  const timezone = profile?.timezone ?? 'Europe/Lisbon';

  const myRankingIndex = profile
    ? ranking.findIndex((row) => row.userId === profile.id)
    : -1;

  const myRanking = myRankingIndex >= 0 ? ranking[myRankingIndex] : null;
  const myPosition = myRankingIndex >= 0 ? myRankingIndex + 1 : null;

  const totalMatches = matches.length;
  const totalPredictions = predictions.length;
  const pendingPredictions = Math.max(totalMatches - totalPredictions, 0);

  const nextMatches = matches
    .filter((match) => match.status !== 'finished')
    .slice(0, 2);

  const isLoading =
    isLoadingMatches || isLoadingPredictions || isLoadingRanking;

  const errorMessage = matchesError || predictionsError || rankingError;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-6 text-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide">
          Mundial Palpites 2026
        </p>
        <h2 className="mt-2 text-3xl font-black">
          Olá{profile?.name ? `, ${profile.name}` : ''}! Faz os teus palpites e
          sobe no ranking
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-medium text-slate-800">
          Os teus palpites são feitos uma única vez por jogo e contam para o
          ranking global e para todas as ligas privadas onde participas.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-400">Horário local da tua conta</p>
        <p className="mt-1 text-lg font-bold text-emerald-300">{timezone}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <Users size={20} />
          </div>

          <div>
            <h3 className="text-lg font-bold">As minhas ligas</h3>
            <p className="text-sm text-slate-400">
              Os teus palpites contam automaticamente para estas ligas.
            </p>
          </div>
        </div>

        {isLoadingLeagues && (
          <p className="text-sm text-slate-400">A carregar ligas...</p>
        )}

        {!isLoadingLeagues && leagues.length === 0 && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            Ainda não estás em nenhuma liga privada. Podes entrar numa liga com
            um código de convite no menu <strong>Ligas</strong>.
          </div>
        )}

        {!isLoadingLeagues && leagues.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {leagues.map((league) => (
              <div
                key={league.id}
                className="rounded-xl border border-white/10 bg-slate-950/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-300">
                      Estás nesta liga
                    </p>
                    <p className="mt-1 text-lg font-bold">{league.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Papel: {league.myRole === 'owner' ? 'Admin' : 'Membro'}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Ativa
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Nota: nesta fase, os palpites são globais. O ranking por liga será
          calculado com base nas pessoas inscritas em cada liga.
        </p>
      </section>

      <ScoringRulesAccordion />

      {errorMessage && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Trophy />}
          label="A tua posição global"
          value={myPosition ? `${myPosition}.º` : '-'}
        />

        <StatCard
          icon={<Target />}
          label="Pontos globais"
          value={String(myRanking?.totalPoints ?? 0)}
        />

        <StatCard
          icon={<CalendarDays />}
          label="Jogos por palpitar"
          value={String(pendingPredictions)}
        />

        <StatCard
          icon={<CheckCircle2 />}
          label="Palpites feitos"
          value={String(totalPredictions)}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<Users />}
          title="Ligas privadas"
          value={String(leagues.length)}
          description="Número de ligas onde estás inscrito."
        />

        <InfoCard
          icon={<Trophy />}
          title="Resumo no ranking global"
          value={`${myRanking?.exactScores ?? 0} exato(s) · ${
            myRanking?.correctOutcomes ?? 0
          } acerto(s)`}
          description="Placares exatos e resultados certos acumulados."
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Próximos jogos</h3>
            <p className="text-sm text-slate-400">
              Dá o teu palpite uma vez por jogo. Ele conta para todas as tuas
              ligas.
            </p>
          </div>

          <a href="/jogos" className="text-sm font-medium text-emerald-300">
            Ver todos
          </a>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
            A carregar dados...
          </div>
        )}

        {!isLoading && !errorMessage && nextMatches.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
            Ainda não existem próximos jogos disponíveis.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {nextMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              timezone={timezone}
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

function InfoCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-emerald-300">{icon}</div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}