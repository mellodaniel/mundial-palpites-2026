import { useState } from 'react';
import { CalendarDays, MapPin, Lock, CheckCircle2 } from 'lucide-react';
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

  const locked = isMatchLocked(match.kickoffUtc);
  const finished = match.status === 'finished';

  async function handleSavePrediction(
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ) {
    await onSavePrediction?.(matchId, predictedHomeScore, predictedAwayScore);
    setIsPredicting(false);
  }

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

        <StatusBadge locked={locked} finished={finished} />
      </div>

      <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Team name={match.homeTeam} code={match.homeTeamCode} />

        <div className="text-center">
          {finished ? (
            <div className="rounded-xl bg-slate-950 px-3 py-2 text-lg font-bold">
              {match.homeScore} - {match.awayScore}
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-400">VS</div>
          )}
        </div>

        <Team name={match.awayTeam} code={match.awayTeamCode} align="right" />
      </div>

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
          disabled={locked || finished}
          onClick={() => setIsPredicting(true)}
          className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {finished
            ? 'Jogo finalizado'
            : locked
            ? 'Palpite bloqueado'
            : prediction
            ? 'Editar palpite'
            : 'Dar palpite'}
        </button>
      )}

      {isPredicting && !locked && !finished && (
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
}: {
  name: string;
  code?: string;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="text-lg font-bold">{name}</p>
      {code && <p className="text-sm text-slate-400">{code}</p>}
    </div>
  );
}

function StatusBadge({
  locked,
  finished,
}: {
  locked: boolean;
  finished: boolean;
}) {
  if (finished) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
        <CheckCircle2 size={14} />
        Finalizado
      </span>
    );
  }

  if (locked) {
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