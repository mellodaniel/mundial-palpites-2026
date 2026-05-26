import { useMemo, useState } from 'react';
import { Lock, Save, CheckCircle2, Clock } from 'lucide-react';
import type { Match, Prediction } from '../types';
import { MatchPredictionStats } from './MatchPredictionStats';

export function MatchCard({
  match,
  timezone,
  prediction,
  onSavePrediction,
}: {
  match: Match;
  timezone: string;
  prediction?: Prediction;
  onSavePrediction: (params: {
    matchId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }) => Promise<void>;
}) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predictedHomeScore?.toString() ?? ''
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predictedAwayScore?.toString() ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const kickoffDate = useMemo(
    () => new Date(match.kickoffUtc),
    [match.kickoffUtc]
  );

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-PT', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: timezone,
      }).format(kickoffDate),
    [kickoffDate, timezone]
  );

  const hasStarted = kickoffDate.getTime() <= Date.now();
  const hasPlaceholderTeams =
    isPlaceholderTeam(match.homeTeam) || isPlaceholderTeam(match.awayTeam);
  const isFinished = match.status === 'finished';

  const isPredictionLocked = hasStarted || hasPlaceholderTeams || isFinished;

  async function handleSavePrediction() {
    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (
      homeScore === '' ||
      awayScore === '' ||
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore) ||
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      setErrorMessage('Insere um palpite válido.');
      setSuccessMessage('');
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      await onSavePrediction({
        matchId: match.id,
        predictedHomeScore: parsedHomeScore,
        predictedAwayScore: parsedAwayScore,
      });

      setSuccessMessage('Palpite guardado.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao guardar palpite.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            #{match.matchNumber} · {match.groupName || match.stage}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {formattedDate} · {match.city}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {match.stadium}, {match.country}
          </p>
        </div>

        <MatchStatusBadge
          isFinished={isFinished}
          isLocked={isPredictionLocked}
          hasStarted={hasStarted}
          hasPlaceholderTeams={hasPlaceholderTeams}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <TeamBlock
          name={match.homeTeam}
          code={match.homeTeamCode}
          align="left"
        />

        <div className="pt-5 text-center text-sm font-black text-slate-500">
          x
        </div>

        <TeamBlock
          name={match.awayTeam}
          code={match.awayTeamCode}
          align="right"
        />
      </div>

      <MatchPredictionStats
        matchId={match.id}
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
      />

      {isFinished && (
        <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/10 p-3 text-center">
          <p className="text-xs uppercase tracking-wide text-blue-300">
            Resultado final
          </p>
          <p className="mt-1 text-xl font-black text-white">
            {match.homeTeam} {match.homeScore} - {match.awayScore}{' '}
            {match.awayTeam}
          </p>
        </div>
      )}

      {prediction && (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-center">
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            O teu palpite
          </p>
          <p className="mt-1 text-xl font-black text-white">
            {match.homeTeam} {prediction.predictedHomeScore} -{' '}
            {prediction.predictedAwayScore} {match.awayTeam}
          </p>

          {isFinished && (
            <p className="mt-1 text-sm font-bold text-emerald-300">
              {prediction.points} ponto(s)
            </p>
          )}
        </div>
      )}

      {(successMessage || errorMessage) && (
        <div className="mt-4 space-y-2">
          {successMessage && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        {isPredictionLocked ? (
          <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-center text-sm text-slate-400">
            <Lock size={16} className="mx-auto mb-2 text-slate-500" />
            {getLockedMessage({
              hasPlaceholderTeams,
              hasStarted,
              isFinished,
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {match.homeTeam}
                </label>

                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(event) => setHomeScore(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-center text-xl font-bold text-white outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>

              <div className="pt-7 text-sm font-bold text-slate-400">x</div>

              <div>
                <label className="mb-2 block text-right text-sm font-medium text-slate-300">
                  {match.awayTeam}
                </label>

                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(event) => setAwayScore(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-center text-xl font-bold text-white outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePrediction}
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Save size={18} />
              {isSaving ? 'A guardar...' : 'Guardar palpite'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function TeamBlock({
  name,
  code,
  align,
}: {
  name: string;
  code?: string;
  align: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="text-lg font-black text-white">{name}</p>

      {code && (
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {code}
        </p>
      )}
    </div>
  );
}

function MatchStatusBadge({
  isFinished,
  isLocked,
  hasStarted,
  hasPlaceholderTeams,
}: {
  isFinished: boolean;
  isLocked: boolean;
  hasStarted: boolean;
  hasPlaceholderTeams: boolean;
}) {
  if (isFinished) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
        <CheckCircle2 size={14} />
        Finalizado
      </span>
    );
  }

  if (hasPlaceholderTeams) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-300">
        <Lock size={14} />
        Equipas por definir
      </span>
    );
  }

  if (isLocked || hasStarted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
        <Lock size={14} />
        Bloqueado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
      <Clock size={14} />
      Aberto
    </span>
  );
}

function getLockedMessage({
  hasPlaceholderTeams,
  hasStarted,
  isFinished,
}: {
  hasPlaceholderTeams: boolean;
  hasStarted: boolean;
  isFinished: boolean;
}) {
  if (isFinished) {
    return 'Jogo finalizado. Já não é possível alterar o palpite.';
  }

  if (hasPlaceholderTeams) {
    return 'Palpite indisponível até as equipas deste jogo serem definidas.';
  }

  if (hasStarted) {
    return 'O jogo já começou. Já não é possível alterar o palpite.';
  }

  return 'Palpite indisponível.';
}

function isPlaceholderTeam(teamName?: string) {
  const normalized = teamName?.trim().toLowerCase() ?? '';

  if (!normalized) return true;

  const placeholderPatterns = [
    'a definir',
    'grupo',
    'vencedor',
    'perdedor',
    '1.º',
    '2.º',
    '3.º',
    '1º',
    '2º',
    '3º',
    'winner',
    'runner-up',
    'third',
  ];

  return placeholderPatterns.some((pattern) => normalized.includes(pattern));
}