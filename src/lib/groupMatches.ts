import type { Match } from '../types';
import { formatDateInTimezone, getDateKeyInTimezone } from './timezone';

export type MatchGroup = {
  key: string;
  title: string;
  subtitle?: string;
  matches: Match[];
};

export function groupMatchesByGroup(matches: Match[]): MatchGroup[] {
  const grouped = new Map<string, Match[]>();

  for (const match of matches) {
    const groupName = match.groupName || match.stage || 'Outros jogos';

    if (!grouped.has(groupName)) {
      grouped.set(groupName, []);
    }

    grouped.get(groupName)!.push(match);
  }

  return Array.from(grouped.entries())
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([key, groupMatches]) => ({
      key: `group-${key}`,
      title: key,
      matches: sortMatchesByKickoff(groupMatches),
    }));
}

export function groupMatchesByDay(
  matches: Match[],
  timezone: string
): MatchGroup[] {
  const grouped = new Map<string, Match[]>();

  for (const match of matches) {
    const dateKey = getDateKeyInTimezone(match.kickoffUtc, timezone);

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(match);
  }

  return Array.from(grouped.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([dateKey, dayMatches]) => {
      const sortedMatches = sortMatchesByKickoff(dayMatches);

      return {
        key: `day-${dateKey}`,
        title: formatDateInTimezone(sortedMatches[0].kickoffUtc, timezone),
        subtitle: timezone,
        matches: sortedMatches,
      };
    });
}

function sortMatchesByKickoff(matches: Match[]) {
  return [...matches].sort(
    (a, b) =>
      new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
  );
}