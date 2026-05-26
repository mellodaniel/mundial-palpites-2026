import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import type { Match, Prediction } from "../types";
import { MatchCard } from "./MatchCard";

export function MatchesAccordion({
  title,
  description,
  matches,
  timezone,
  predictions,
  onSavePrediction,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  matches: Match[];
  timezone: string;
  predictions: Prediction[];
  onSavePrediction: (params: {
    matchId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }) => Promise<void>;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (a, b) =>
          new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
      ),
    [matches]
  );

  const finishedMatches = sortedMatches.filter(
    (match) => match.status === "finished"
  ).length;

  const availableMatches = sortedMatches.filter(
    (match) => match.status !== "finished"
  ).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <CalendarDays size={20} />
          </div>

          <div>
            <h3 className="font-bold">{title}</h3>

            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}

            <p className="mt-1 text-xs text-slate-500">
              {sortedMatches.length} jogo(s) · {availableMatches} por finalizar
              · {finishedMatches} finalizado(s)
            </p>
          </div>
        </div>

        {isOpen ? (
          <ChevronDown className="shrink-0 text-emerald-300" />
        ) : (
          <ChevronRight className="shrink-0 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-white/10 p-4">
          {sortedMatches.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">
              Não existem jogos nesta secção.
            </div>
          )}

          {sortedMatches.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  timezone={timezone}
                  prediction={predictions.find(
                    (prediction) => prediction.matchId === match.id
                  )}
                  onSavePrediction={onSavePrediction}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
