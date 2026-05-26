import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Match, Prediction } from '../types';
import type { MatchGroup } from '../lib/groupMatches';
import { MatchCard } from './MatchCard';

type Props = {
  groups: MatchGroup[];
  predictions: Prediction[];
  timezone: string;
  onSavePrediction: (
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ) => Promise<void> | void;
};

export function MatchesAccordion({
  groups,
  predictions,
  timezone,
  onSavePrediction,
}: Props) {
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    groups.slice(0, 1).map((group) => group.key)
  );

  function toggleGroup(key: string) {
    setOpenGroups((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = openGroups.includes(group.key);

        return (
          <section
            key={group.key}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
            >
              <div>
                <h3 className="text-lg font-bold">{group.title}</h3>
                <p className="text-sm text-slate-400">
                  {group.matches.length} jogo(s)
                </p>
              </div>

              {isOpen ? (
                <ChevronDown className="text-emerald-300" />
              ) : (
                <ChevronRight className="text-slate-400" />
              )}
            </button>

            {isOpen && (
              <div className="grid gap-4 border-t border-white/10 p-4 md:grid-cols-2">
                {group.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    timezone={timezone}
                    prediction={findPrediction(predictions, match)}
                    onSavePrediction={onSavePrediction}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function findPrediction(predictions: Prediction[], match: Match) {
  return predictions.find((prediction) => prediction.matchId === match.id);
}