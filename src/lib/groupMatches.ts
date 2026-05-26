import type { Match } from '../types';
import { formatDateInTimezone, getDateKeyInTimezone } from './timezone';

export type MatchGroup = {
  key: string;
  title: string;
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

  return Array.from(grouped.entries()).map(([key, groupMatches]) => ({
    key,
    title: key,
    matches: groupMatches.sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
    ),
  }));
}

export function groupMatchesByDay(
  matches: Match[],
  timezone: string
): MatchGroup[] {
  const grouped = new Map<string, Match[]>();

  for (const match of matches) {
    const key = getDateKeyInTimezone(match.kickoffUtc, timezone);

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)!.push(match);
  }

  return Array.from(grouped.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([key, dayMatches]) => ({
      key,
      title: formatDateInTimezone(dayMatches[0].kickoffUtc, timezone),
      matches: dayMatches.sort(
        (a, b) =>
          new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
      ),
    }));
}