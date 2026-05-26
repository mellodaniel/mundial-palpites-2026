import { CalendarDays, Trophy } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';
import { ScoringRulesAccordion } from '../components/ScoringRulesAccordion';
import type { League } from '../types';
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
          Dá o teu palpite uma vez por jogo. Ele conta para o ranking global e
          para todas as ligas privadas onde participas.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Horário local da tua conta</p>
          <p className="mt-1 text-lg font-bold text-emerald-300">{timezone}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Ligas privadas</p>

          {isLoadingLeagues && (
            <p className="mt-1 text-sm text-slate-400">A carregar ligas...</p>
          )}

          {!isLoadingLeagues && leagues.length === 0 && (
            <p className="mt-1 text-sm text-amber-300">
              Ainda não estás em nenhuma liga privada.
            </p>
          )}

          {!isLoadingLeagues && leagues.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {leagues.map((league) => (
                <span
                  key={league.id}
                  className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300"
                >
                  {league.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <Trophy size={20} />
          </div>

          <div>
            <h3 className="text-lg font-bold">A tua posição nos rankings</h3>
            <p className="text-sm text-slate-400">
              Posição global e posição nas tuas ligas privadas.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <RankingPositionCard
            title="Ranking Global"
            subtitle="Todos os participantes"
            position={myPosition}
            isLoading={isLoadingRanking}
          />

          {isLoadingLeagues && (
            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">
              A carregar ligas...
            </div>
          )}

          {!isLoadingLeagues &&
            leagues.map((league) =>
              profile ? (
                <LeagueRankingPositionCard
                  key={league.id}
                  league={league}
                  userId={profile.id}
                />
              ) : null
            )}
        </div>

        {!isLoadingLeagues && leagues.length === 0 && (
          <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            Entra numa liga com um código de convite no menu{' '}
            <strong>Ligas</strong>.
          </div>
        )}
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <CalendarDays size={20} />
          </div>

          <div>
            <h3 className="font-bold">Resumo dos palpites</h3>
            <p className="text-sm text-slate-400">
              Acompanha rapidamente o que já fizeste e o que ainda falta.
            </p>
          </div>
        </div>

        <p className="text-3xl font-black">
          {totalPredictions} / {totalMatches}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem
            label="Jogos por palpitar"
            value={String(pendingPredictions)}
          />

          <SummaryItem
            label="Palpites feitos"
            value={String(totalPredictions)}
          />

          <SummaryItem
            label="Pontos"
            value={String(myRanking?.totalPoints ?? 0)}
          />

          <SummaryItem
            label="Resultados - Exatos / Acertos"
            value={`${myRanking?.exactScores ?? 0} / ${
              myRanking?.correctOutcomes ?? 0
            }`}
          />
        </div>
      </section>

      <ScoringRulesAccordion />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Próximos jogos</h3>
            <p className="text-sm text-slate-400">
              Dá o teu palpite uma vez por jogo. Ele conta para todas as tuas
              ligas.
            </p>
          </div>

          <a
            href="/jogos"
            className="shrink-0 text-sm font-medium text-emerald-300"
          >
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

function LeagueRankingPositionCard({
  league,
  userId,
}: {
  league: League;
  userId: string;
}) {
  const { ranking, isLoadingRanking, rankingError } = useRanking(league.id);

  const myLeagueRankingIndex = ranking.findIndex((row) => row.userId === userId);
  const myLeaguePosition =
    myLeagueRankingIndex >= 0 ? myLeagueRankingIndex + 1 : null;

  return (
    <RankingPositionCard
      title={league.name}
      subtitle="Liga privada"
      position={myLeaguePosition}
      isLoading={isLoadingRanking}
      errorMessage={rankingError}
    />
  );
}

function RankingPositionCard({
  title,
  subtitle,
  position,
  isLoading,
  errorMessage,
}: {
  title: string;
  subtitle: string;
  position: number | null;
  isLoading: boolean;
  errorMessage?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            {subtitle}
          </p>
          <h4 className="mt-1 text-lg font-bold">{title}</h4>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
          <Trophy size={18} />
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-400">A carregar...</p>}

      {!isLoading && errorMessage && (
        <p className="text-sm text-red-300">{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && (
        <p className="text-4xl font-black text-white">
          {position ? `${position}.º` : '-'}
        </p>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}