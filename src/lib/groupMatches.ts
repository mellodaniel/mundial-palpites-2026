import type { Match } from '../types';
import { formatDateInTimezone, getDateKeyInTimezone } from './timezone';

export type MatchGroup = {
  key: string;
  title: string;
  subtitle?: string;
  matches: Match[];
};

const GROUP_STAGE_ORDER = [
  'Grupo A',
  'Grupo B',
  'Grupo C',
  'Grupo D',
  'Grupo E',
  'Grupo F',
  'Grupo G',
  'Grupo H',
  'Grupo I',
  'Grupo J',
  'Grupo K',
  'Grupo L',
];

const KNOCKOUT_STAGE_ORDER = [
  'Ronda de 32',
  'Ronda de 16',
  'Quartos de Final',
  'Meia-final',
  '3.º lugar',
  'Final',
];

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
    .sort(([groupA], [groupB]) => getGroupOrder(groupA) - getGroupOrder(groupB))
    .map(([key, groupMatches]) => ({
      key: `group-${key}`,
      title: key,
      matches: sortMatchesByNumber(groupMatches),
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

function getGroupOrder(groupName: string) {
  const groupIndex = GROUP_STAGE_ORDER.indexOf(groupName);

  if (groupIndex >= 0) {
    return groupIndex;
  }

  const knockoutIndex = KNOCKOUT_STAGE_ORDER.indexOf(groupName);

  if (knockoutIndex >= 0) {
    return GROUP_STAGE_ORDER.length + knockoutIndex;
  }

  return 999;
}

function sortMatchesByKickoff(matches: Match[]) {
  return [...matches].sort(
    (a, b) =>
      new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
  );
}

function sortMatchesByNumber(matches: Match[]) {
  return [...matches].sort((a, b) => a.matchNumber - b.matchNumber);
}