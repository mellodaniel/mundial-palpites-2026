import { useState } from 'react';
import {
  CalendarDays,
  MapPin,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { Match, Prediction } from '../types';
import { isMatchLocked } from '../lib/dates';
import { formatDateTimeInTimezone } from '../lib/timezone';
import { PredictionForm } from './PredictionForm';

type Props = {
  match: Match;
  prediction?: Prediction;
  timezone?: string;
  onSavePrediction?: (
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ) => Promise<void> | void;
};

export function MatchCard({
  match,
  prediction,
  timezone,
  onSavePrediction,
}: Props) {
  const [isPredicting, setIsPredicting] = useState(false);

  const lockedByTime = isMatchLocked(match.kickoffUtc);
  const finished = match.status === 'finished';
  const teamsPending = hasPendingTeams(match);

  async function handleSavePrediction(
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ) {
    await onSavePrediction?.(matchId, predictedHomeScore, predictedAwayScore);
    setIsPredicting(false);
  }

  const buttonLabel = getButtonLabel({
    finished,
    lockedByTime,
    teamsPending,
    hasPrediction: Boolean(prediction),
  });

  const isButtonDisabled = finished || lockedByTime || teamsPending;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Jogo #{match.matchNumber} · {match.stage}
          </p>
          {match.groupName && (
            <p className="text-sm text-slate-400">{match.groupName}</p>
          )}
        </div>

        <StatusBadge
          lockedByTime={lockedByTime}
          finished={finished}
          teamsPending={teamsPending}
        />
      </div>

      <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Team
          name={match.homeTeam}
          code={match.homeTeamCode}
          isPlaceholder={isPlaceholderTeam(match.homeTeam)}
        />

        <div className="text-center">
          {finished ? (
            <div className="rounded-xl bg-slate-950 px-3 py-2 text-lg font-bold">
              {match.homeScore} - {match.awayScore}
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-400">VS</div>
          )}
        </div>

        <Team
          name={match.awayTeam}
          code={match.awayTeamCode}
          align="right"
          isPlaceholder={isPlaceholderTeam(match.awayTeam)}
        />
      </div>

      {teamsPending && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <div className="flex gap-2 text-amber-100">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Equipas ainda por definir</p>
              <p className="mt-1 text-sm text-amber-100/80">
                Este jogo será desbloqueado automaticamente quando as equipas
                reais forem atualizadas.
              </p>
            </div>
          </div>
        </div>
      )}

      {prediction && (
        <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            O teu palpite
          </p>
          <p className="mt-1 text-lg font-black">
            {match.homeTeam} {prediction.predictedHomeScore} -{' '}
            {prediction.predictedAwayScore} {match.awayTeam}
          </p>
        </div>
      )}

      <div className="space-y-2 border-t border-white/10 pt-3 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-emerald-300" />
          <span>
            {formatDateTimeInTimezone(match.kickoffUtc, timezone)} · horário
            local
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-emerald-300" />
          <span>
            {match.stadium}, {match.city}
          </span>
        </div>
      </div>

      {!isPredicting && (
        <button
          disabled={isButtonDisabled}
          onClick={() => setIsPredicting(true)}
          className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {buttonLabel}
        </button>
      )}

      {isPredicting && !lockedByTime && !finished && !teamsPending && (
        <PredictionForm
          match={match}
          currentPrediction={prediction}
          onSave={handleSavePrediction}
          onCancel={() => setIsPredicting(false)}
        />
      )}
    </article>
  );
}

function Team({
  name,
  code,
  align = 'left',
  isPlaceholder = false,
}: {
  name: string;
  code?: string;
  align?: 'left' | 'right';
  isPlaceholder?: boolean;
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p
        className={`text-lg font-bold ${
          isPlaceholder ? 'text-amber-200' : 'text-white'
        }`}
      >
        {name}
      </p>
      {code && <p className="text-sm text-slate-400">{code}</p>}
    </div>
  );
}

function StatusBadge({
  lockedByTime,
  finished,
  teamsPending,
}: {
  lockedByTime: boolean;
  finished: boolean;
  teamsPending: boolean;
}) {
  if (finished) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
        <CheckCircle2 size={14} />
        Finalizado
      </span>
    );
  }

  if (teamsPending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
        <AlertTriangle size={14} />
        Por definir
      </span>
    );
  }

  if (lockedByTime) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
        <Lock size={14} />
        Bloqueado
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
      Aberto
    </span>
  );
}

function getButtonLabel({
  finished,
  lockedByTime,
  teamsPending,
  hasPrediction,
}: {
  finished: boolean;
  lockedByTime: boolean;
  teamsPending: boolean;
  hasPrediction: boolean;
}) {
  if (finished) return 'Jogo finalizado';
  if (lockedByTime) return 'Palpite bloqueado';
  if (teamsPending) return 'Palpite indisponível';
  if (hasPrediction) return 'Editar palpite';
  return 'Dar palpite';
}

function hasPendingTeams(match: Match) {
  return isPlaceholderTeam(match.homeTeam) || isPlaceholderTeam(match.awayTeam);
}

function isPlaceholderTeam(teamName: string) {
  const normalized = teamName.trim().toLowerCase();

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