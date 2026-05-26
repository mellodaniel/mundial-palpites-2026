import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Trash2,
  Trophy,
  UserMinus,
} from 'lucide-react';
import {
  deleteLeague,
  getAdminLeagues,
  removeLeagueMember,
  updateLeagueName,
  type AdminLeagueRow,
  type AdminLeagueMember,
} from '../lib/adminLeaguesApi';

export function AdminLeaguesManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [openLeagueIds, setOpenLeagueIds] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<AdminLeagueRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLeagueId, setEditingLeagueId] = useState('');
  const [editingLeagueName, setEditingLeagueName] = useState('');
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [isSavingId, setIsSavingId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadLeagues() {
    try {
      setIsLoadingLeagues(true);
      setErrorMessage('');

      const leaguesFromApi = await getAdminLeagues();

      setLeagues(leaguesFromApi);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar ligas.';

      setErrorMessage(message);
    } finally {
      setIsLoadingLeagues(false);
    }
  }

  useEffect(() => {
    if (isOpen && leagues.length === 0) {
      loadLeagues();
    }
  }, [isOpen, leagues.length]);

  const filteredLeagues = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return leagues;
    }

    return leagues.filter((league) => {
      const membersText = league.members
        .map((member) => member.name)
        .join(' ')
        .toLowerCase();

      return (
        league.name.toLowerCase().includes(normalizedSearch) ||
        league.inviteCode.toLowerCase().includes(normalizedSearch) ||
        membersText.includes(normalizedSearch)
      );
    });
  }, [leagues, searchTerm]);

  function toggleLeague(leagueId: string) {
    setOpenLeagueIds((current) =>
      current.includes(leagueId)
        ? current.filter((id) => id !== leagueId)
        : [...current, leagueId]
    );
  }

  function openAllLeagues() {
    setOpenLeagueIds(filteredLeagues.map((league) => league.id));
  }

  function closeAllLeagues() {
    setOpenLeagueIds([]);
  }

  function startEditingLeague(league: AdminLeagueRow) {
    setEditingLeagueId(league.id);
    setEditingLeagueName(league.name);
    setSuccessMessage('');
    setErrorMessage('');
  }

  function cancelEditingLeague() {
    setEditingLeagueId('');
    setEditingLeagueName('');
  }

  async function handleSaveLeagueName(league: AdminLeagueRow) {
    try {
      setIsSavingId(league.id);
      setSuccessMessage('');
      setErrorMessage('');

      await updateLeagueName({
        leagueId: league.id,
        name: editingLeagueName,
      });

      setLeagues((current) =>
        current.map((item) =>
          item.id === league.id ? { ...item, name: editingLeagueName.trim() } : item
        )
      );

      setSuccessMessage('Nome da liga atualizado.');
      cancelEditingLeague();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar liga.';

      setErrorMessage(message);
    } finally {
      setIsSavingId('');
    }
  }

  async function handleRemoveMember(league: AdminLeagueRow, member: AdminLeagueMember) {
    const confirmed = window.confirm(
      `Tens a certeza que queres remover "${member.name}" da liga "${league.name}"?`
    );

    if (!confirmed) return;

    try {
      setIsSavingId(member.id);
      setSuccessMessage('');
      setErrorMessage('');

      await removeLeagueMember({
        membershipId: member.id,
      });

      setLeagues((current) =>
        current.map((item) =>
          item.id === league.id
            ? {
                ...item,
                members: item.members.filter(
                  (leagueMember) => leagueMember.id !== member.id
                ),
              }
            : item
        )
      );

      setSuccessMessage(`${member.name} foi removido da liga ${league.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao remover membro.';

      setErrorMessage(message);
    } finally {
      setIsSavingId('');
    }
  }

  async function handleDeleteLeague(league: AdminLeagueRow) {
    const confirmed = window.confirm(
      `Tens a certeza que queres apagar a liga "${league.name}"? Isto remove todos os membros desta liga, mas não apaga os utilizadores nem os palpites.`
    );

    if (!confirmed) return;

    try {
      setIsSavingId(league.id);
      setSuccessMessage('');
      setErrorMessage('');

      await deleteLeague({
        leagueId: league.id,
      });

      setLeagues((current) => current.filter((item) => item.id !== league.id));
      setOpenLeagueIds((current) => current.filter((id) => id !== league.id));

      setSuccessMessage(`Liga ${league.name} apagada.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao apagar liga.';

      setErrorMessage(message);
    } finally {
      setIsSavingId('');
    }
  }

  async function copyInviteCode(inviteCode: string) {
    await navigator.clipboard.writeText(inviteCode);
    setSuccessMessage(`Código ${inviteCode} copiado.`);
    setErrorMessage('');
  }

  const totalMembers = leagues.reduce(
    (total, league) => total + league.members.length,
    0
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <Trophy size={20} />
          </div>

          <div>
            <h3 className="font-bold">Gestão de ligas</h3>
            <p className="text-sm text-slate-400">
              Consulta ligas, membros, códigos de convite e remove membros.
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
        <div className="space-y-4 border-t border-white/10 p-5">
          {(successMessage || errorMessage) && (
            <div className="space-y-3">
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

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Pesquisar liga, código ou membro
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-10 py-3 text-white outline-none focus:border-emerald-400"
                  placeholder="Amigos, código, Daniel..."
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={loadLeagues}
                disabled={isLoadingLeagues}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw size={18} />
                {isLoadingLeagues ? 'A atualizar...' : 'Atualizar'}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Ligas" value={String(leagues.length)} />
            <SummaryCard label="Membros inscritos" value={String(totalMembers)} />
            <SummaryCard
              label="Resultados filtrados"
              value={String(filteredLeagues.length)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAllLeagues}
              disabled={filteredLeagues.length === 0}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Abrir ligas
            </button>

            <button
              type="button"
              onClick={closeAllLeagues}
              disabled={openLeagueIds.length === 0}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Fechar ligas
            </button>
          </div>

          {isLoadingLeagues && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              A carregar ligas...
            </div>
          )}

          {!isLoadingLeagues && filteredLeagues.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              Nenhuma liga encontrada.
            </div>
          )}

          {!isLoadingLeagues && filteredLeagues.length > 0 && (
            <div className="space-y-3">
              {filteredLeagues.map((league) => (
                <LeagueCard
                  key={league.id}
                  league={league}
                  isOpen={openLeagueIds.includes(league.id)}
                  isSaving={isSavingId === league.id}
                  isEditing={editingLeagueId === league.id}
                  editingLeagueName={editingLeagueName}
                  onToggleOpen={toggleLeague}
                  onStartEditing={startEditingLeague}
                  onCancelEditing={cancelEditingLeague}
                  onEditingNameChange={setEditingLeagueName}
                  onSaveLeagueName={handleSaveLeagueName}
                  onCopyInviteCode={copyInviteCode}
                  onRemoveMember={handleRemoveMember}
                  onDeleteLeague={handleDeleteLeague}
                  savingId={isSavingId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function LeagueCard({
  league,
  isOpen,
  isSaving,
  isEditing,
  editingLeagueName,
  onToggleOpen,
  onStartEditing,
  onCancelEditing,
  onEditingNameChange,
  onSaveLeagueName,
  onCopyInviteCode,
  onRemoveMember,
  onDeleteLeague,
  savingId,
}: {
  league: AdminLeagueRow;
  isOpen: boolean;
  isSaving: boolean;
  isEditing: boolean;
  editingLeagueName: string;
  onToggleOpen: (leagueId: string) => void;
  onStartEditing: (league: AdminLeagueRow) => void;
  onCancelEditing: () => void;
  onEditingNameChange: (value: string) => void;
  onSaveLeagueName: (league: AdminLeagueRow) => void;
  onCopyInviteCode: (inviteCode: string) => void;
  onRemoveMember: (league: AdminLeagueRow, member: AdminLeagueMember) => void;
  onDeleteLeague: (league: AdminLeagueRow) => void;
  savingId: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
      <button
        type="button"
        onClick={() => onToggleOpen(league.id)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-white/5"
      >
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-black">{league.name}</h4>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
              {league.members.length} membro(s)
            </span>
          </div>

          <p className="font-mono text-sm text-slate-400">
            Código: {league.inviteCode}
          </p>
        </div>

        {isOpen ? (
          <ChevronDown className="shrink-0 text-emerald-300" />
        ) : (
          <ChevronRight className="shrink-0 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-white/10 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nome da liga
              </label>

              <input
                value={isEditing ? editingLeagueName : league.name}
                onChange={(event) => onEditingNameChange(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400 disabled:opacity-70"
              />
            </div>

            <div className="flex flex-wrap items-end gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => onStartEditing(league)}
                  className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15"
                >
                  Editar nome
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSaveLeagueName(league)}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />
                    Guardar
                  </button>

                  <button
                    type="button"
                    onClick={onCancelEditing}
                    className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Código de convite</p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="font-mono text-xl font-black">{league.inviteCode}</p>

              <button
                type="button"
                onClick={() => onCopyInviteCode(league.inviteCode)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
              >
                <Copy size={16} />
                Copiar
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Membros da liga
            </p>

            {league.members.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                Esta liga ainda não tem membros.
              </div>
            )}

            {league.members.length > 0 && (
              <div className="space-y-2">
                {league.members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isSaving={savingId === member.id}
                    onRemove={() => onRemoveMember(league, member)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
            <p className="text-sm font-semibold text-red-200">Zona perigosa</p>
            <p className="mt-1 text-sm text-red-100/80">
              Apagar uma liga remove a liga e os membros dela, mas não apaga
              utilizadores nem palpites.
            </p>

            <button
              type="button"
              onClick={() => onDeleteLeague(league)}
              disabled={isSaving}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={18} />
              Apagar liga
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function MemberRow({
  member,
  isSaving,
  onRemove,
}: {
  member: AdminLeagueMember;
  isSaving: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{member.name}</p>

            {member.role === 'owner' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                <Shield size={14} />
                Admin da liga
              </span>
            )}

            {member.isAdmin && (
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                Admin app
              </span>
            )}

            {member.accountStatus !== 'active' && (
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                {member.accountStatus}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Entrou em {formatDate(member.joinedAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserMinus size={18} />
          Remover
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}