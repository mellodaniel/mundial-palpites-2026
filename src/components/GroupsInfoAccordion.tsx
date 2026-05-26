import { ChevronDown, ChevronRight, Info, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Match } from '../types';

type GroupInfo = {
  groupName: string;
  teams: {
    name: string;
    code?: string;
  }[];
};

type Props = {
  matches: Match[];
};

export function GroupsInfoAccordion({ matches }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const groups = useMemo(() => buildGroupsInfo(matches), [matches]);

  function toggleMain() {
    setIsOpen((current) => !current);
  }

  function toggleGroup(groupName: string) {
    setOpenGroups((current) =>
      current.includes(groupName)
        ? current.filter((item) => item !== groupName)
        : [...current, groupName]
    );
  }

  function openAllGroups() {
    setOpenGroups(groups.map((group) => group.groupName));
  }

  function closeAllGroups() {
    setOpenGroups([]);
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={toggleMain}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <Info size={20} />
          </div>

          <div>
            <h3 className="text-lg font-bold">Grupos e seleções</h3>
            <p className="text-sm text-slate-400">
              Consulta rápida das seleções por grupo.
            </p>
          </div>
        </div>

        {isOpen ? (
          <ChevronDown className="text-emerald-300" />
        ) : (
          <ChevronRight className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAllGroups}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
            >
              Abrir grupos
            </button>

            <button
              type="button"
              onClick={closeAllGroups}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
            >
              Fechar grupos
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((group) => {
              const groupIsOpen = openGroups.includes(group.groupName);

              return (
                <div
                  key={group.groupName}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.groupName)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
                  >
                    <div>
                      <h4 className="font-bold">{group.groupName}</h4>
                      <p className="text-sm text-slate-400">
                        {group.teams.length} seleção(ões)
                      </p>
                    </div>

                    {groupIsOpen ? (
                      <ChevronDown className="text-emerald-300" size={20} />
                    ) : (
                      <ChevronRight className="text-slate-400" size={20} />
                    )}
                  </button>

                  {groupIsOpen && (
                    <div className="border-t border-white/10 p-4">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {group.teams.map((team) => (
                          <div
                            key={`${group.groupName}-${team.name}`}
                            className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
                                <Users size={16} />
                              </div>

                              <span className="font-semibold">{team.name}</span>
                            </div>

                            {team.code && (
                              <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                                {team.code}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function buildGroupsInfo(matches: Match[]): GroupInfo[] {
  const groupsMap = new Map<
    string,
    Map<string, { name: string; code?: string }>
  >();

  for (const match of matches) {
    if (!match.groupName) continue;

    if (!groupsMap.has(match.groupName)) {
      groupsMap.set(match.groupName, new Map());
    }

    const teamsMap = groupsMap.get(match.groupName)!;

    addTeamToGroup(teamsMap, match.homeTeam, match.homeTeamCode);
    addTeamToGroup(teamsMap, match.awayTeam, match.awayTeamCode);
  }

  return Array.from(groupsMap.entries())
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([groupName, teamsMap]) => ({
      groupName,
      teams: Array.from(teamsMap.values()).sort((teamA, teamB) =>
        teamA.name.localeCompare(teamB.name)
      ),
    }));
}

function addTeamToGroup(
  teamsMap: Map<string, { name: string; code?: string }>,
  teamName: string,
  teamCode?: string
) {
  const normalizedName = teamName.trim();

  if (!normalizedName || normalizedName === 'A definir') {
    return;
  }

  if (!teamsMap.has(normalizedName)) {
    teamsMap.set(normalizedName, {
      name: normalizedName,
      code: teamCode,
    });
  }
}