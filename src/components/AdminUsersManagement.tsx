import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  ChevronDown,
  ChevronRight,
  Power,
  RefreshCcw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Undo2,
  UserCog,
  Users,
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getAdminUsers,
  updateUserAccountStatus,
  updateUserAdminStatus,
  type AccountStatus,
  type AdminUserRow,
} from '../lib/adminUsersApi';

export function AdminUsersManagement() {
  const { user: loggedUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [openUserIds, setOpenUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSavingUserId, setIsSavingUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadUsers() {
    try {
      setIsLoadingUsers(true);
      setErrorMessage('');

      const usersFromApi = await getAdminUsers();

      setUsers(usersFromApi);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao carregar utilizadores.';

      setErrorMessage(message);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (isOpen && users.length === 0) {
      loadUsers();
    }
  }, [isOpen, users.length]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      const leaguesText = user.leagues
        .map((league) => league.name)
        .join(' ')
        .toLowerCase();

      return (
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.accountStatus.toLowerCase().includes(normalizedSearch) ||
        leaguesText.includes(normalizedSearch)
      );
    });
  }, [users, searchTerm]);

  function toggleUser(userId: string) {
    setOpenUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  function openAllUsers() {
    setOpenUserIds(filteredUsers.map((user) => user.id));
  }

  function closeAllUsers() {
    setOpenUserIds([]);
  }

  function isCurrentUser(userId: string) {
    return loggedUser?.id === userId;
  }

  async function handleToggleAdmin(user: AdminUserRow) {
    if (isCurrentUser(user.id)) {
      setErrorMessage(
        'Não podes remover ou alterar o teu próprio acesso admin.'
      );
      return;
    }

    if (user.accountStatus === 'deleted') {
      setErrorMessage(
        'Não é possível alterar permissões de um utilizador removido.'
      );
      return;
    }

    const nextStatus = !user.isAdmin;

    const confirmed = window.confirm(
      nextStatus
        ? `Tens a certeza que queres tornar "${user.name}" admin?`
        : `Tens a certeza que queres remover o acesso admin de "${user.name}"?`
    );

    if (!confirmed) return;

    try {
      setIsSavingUserId(user.id);
      setSuccessMessage('');
      setErrorMessage('');

      await updateUserAdminStatus({
        userId: user.id,
        isAdmin: nextStatus,
      });

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isAdmin: nextStatus } : item
        )
      );

      setSuccessMessage(
        nextStatus
          ? `${user.name} agora é admin.`
          : `${user.name} deixou de ser admin.`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar utilizador.';

      setErrorMessage(message);
    } finally {
      setIsSavingUserId('');
    }
  }

  async function handleChangeAccountStatus(
    user: AdminUserRow,
    status: AccountStatus
  ) {
    if (isCurrentUser(user.id)) {
      setErrorMessage(
        'Não podes desativar, bloquear, excluir ou reativar a tua própria conta.'
      );
      return;
    }

    const messages: Record<AccountStatus, string> = {
      active: `Queres reativar o utilizador "${user.name}"?`,
      disabled: `Queres desativar o utilizador "${user.name}"? Ele deixará de conseguir usar a app.`,
      blocked: `Queres bloquear o utilizador "${user.name}"? Ele deixará de conseguir usar a app.`,
      deleted: `Queres excluir "${user.name}" da app? Isto remove-o das ligas, anonimiza o perfil e bloqueia o acesso.`,
    };

    const confirmed = window.confirm(messages[status]);

    if (!confirmed) return;

    const note =
      status === 'active'
        ? ''
        : window.prompt('Nota interna opcional sobre esta ação:') ?? '';

    try {
      setIsSavingUserId(user.id);
      setSuccessMessage('');
      setErrorMessage('');

      await updateUserAccountStatus({
        userId: user.id,
        status,
        note,
      });

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                name: status === 'deleted' ? 'Utilizador removido' : item.name,
                isAdmin: status === 'deleted' ? false : item.isAdmin,
                accountStatus: status,
                adminNote: note || undefined,
                leagues: status === 'deleted' ? [] : item.leagues,
              }
            : item
        )
      );

      setSuccessMessage(getStatusSuccessMessage(user.name, status));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar estado do utilizador.';

      setErrorMessage(message);
    } finally {
      setIsSavingUserId('');
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <UserCog size={20} />
          </div>

          <div>
            <h3 className="font-bold">Gestão de utilizadores</h3>
            <p className="text-sm text-slate-400">
              Consulta utilizadores, ligas, palpites, permissões e estado da
              conta.
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

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Por segurança, o admin logado não pode remover o próprio acesso
            admin, nem desativar, bloquear ou excluir a própria conta.
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Pesquisar utilizador, estado ou liga
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
                  placeholder="Daniel, Arthur, ativo, bloqueado..."
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={loadUsers}
                disabled={isLoadingUsers}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw size={18} />
                {isLoadingUsers ? 'A atualizar...' : 'Atualizar'}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <SummaryCard label="Utilizadores" value={String(users.length)} />
            <SummaryCard
              label="Ativos"
              value={String(
                users.filter((user) => user.accountStatus === 'active').length
              )}
            />
            <SummaryCard
              label="Bloqueados"
              value={String(
                users.filter((user) => user.accountStatus === 'blocked').length
              )}
            />
            <SummaryCard
              label="Desativados"
              value={String(
                users.filter((user) => user.accountStatus === 'disabled').length
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAllUsers}
              disabled={filteredUsers.length === 0}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Abrir utilizadores
            </button>

            <button
              type="button"
              onClick={closeAllUsers}
              disabled={openUserIds.length === 0}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Fechar utilizadores
            </button>
          </div>

          {isLoadingUsers && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              A carregar utilizadores...
            </div>
          )}

          {!isLoadingUsers && filteredUsers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              Nenhum utilizador encontrado.
            </div>
          )}

          {!isLoadingUsers && filteredUsers.length > 0 && (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isCurrentUser={isCurrentUser(user.id)}
                  isOpen={openUserIds.includes(user.id)}
                  isSaving={isSavingUserId === user.id}
                  onToggleOpen={toggleUser}
                  onToggleAdmin={handleToggleAdmin}
                  onChangeAccountStatus={handleChangeAccountStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
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

function UserCard({
  user,
  isCurrentUser,
  isOpen,
  isSaving,
  onToggleOpen,
  onToggleAdmin,
  onChangeAccountStatus,
}: {
  user: AdminUserRow;
  isCurrentUser: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onToggleOpen: (userId: string) => void;
  onToggleAdmin: (user: AdminUserRow) => void;
  onChangeAccountStatus: (user: AdminUserRow, status: AccountStatus) => void;
}) {
  const isDeleted = user.accountStatus === 'deleted';
  const protectedSelfAction = isCurrentUser || isDeleted;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
      <button
        type="button"
        onClick={() => onToggleOpen(user.id)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-white/5"
      >
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-black">{user.name}</h4>

            {isCurrentUser && (
              <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                Tu
              </span>
            )}

            <StatusBadge status={user.accountStatus} />

            {user.isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                <Shield size={14} />
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                <Users size={14} />
                Membro
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400">
            {user.totalPredictions} palpite(s) · {user.totalPoints} ponto(s) ·{' '}
            {user.leagues.length} liga(s)
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
          {isCurrentUser && (
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Esta é a tua conta. As ações críticas estão bloqueadas para evitar
              perda de acesso.
            </div>
          )}

          <p className="text-sm text-slate-400">
            Criado em {formatDate(user.createdAt)}
          </p>

          {user.adminNote && (
            <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Nota admin: {user.adminNote}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <UserStat label="Palpites" value={String(user.totalPredictions)} />
            <UserStat label="Pontos" value={String(user.totalPoints)} />
            <UserStat label="Ligas" value={String(user.leagues.length)} />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Ligas do utilizador
            </p>

            {user.leagues.length === 0 && (
              <p className="text-sm text-slate-400">
                Não está em nenhuma liga.
              </p>
            )}

            {user.leagues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.leagues.map((league) => (
                  <span
                    key={league.id}
                    className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                  >
                    {league.name}
                    {league.role === 'owner' ? ' · Admin' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => onToggleAdmin(user)}
              disabled={isSaving || protectedSelfAction}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                user.isAdmin
                  ? 'bg-red-500/10 text-red-200 hover:bg-red-500/15'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {user.isAdmin ? <ShieldOff size={18} /> : <Shield size={18} />}
              {isSaving
                ? 'A guardar...'
                : user.isAdmin
                  ? 'Remover admin'
                  : 'Tornar admin'}
            </button>

            {user.accountStatus !== 'active' ? (
              <button
                type="button"
                onClick={() => onChangeAccountStatus(user, 'active')}
                disabled={isSaving || isCurrentUser}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Undo2 size={18} />
                Reativar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onChangeAccountStatus(user, 'disabled')}
                  disabled={isSaving || isCurrentUser}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Power size={18} />
                  Desativar
                </button>

                <button
                  type="button"
                  onClick={() => onChangeAccountStatus(user, 'blocked')}
                  disabled={isSaving || isCurrentUser}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 font-semibold text-amber-200 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Ban size={18} />
                  Bloquear
                </button>

                <button
                  type="button"
                  onClick={() => onChangeAccountStatus(user, 'deleted')}
                  disabled={isSaving || isCurrentUser}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  Excluir
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const config = {
    active: {
      label: 'Ativo',
      className: 'bg-emerald-500/10 text-emerald-300',
    },
    disabled: {
      label: 'Desativado',
      className: 'bg-white/10 text-slate-300',
    },
    blocked: {
      label: 'Bloqueado',
      className: 'bg-amber-500/10 text-amber-300',
    },
    deleted: {
      label: 'Excluído',
      className: 'bg-red-500/10 text-red-300',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function UserStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function getStatusSuccessMessage(userName: string, status: AccountStatus) {
  if (status === 'active') return `${userName} foi reativado.`;
  if (status === 'disabled') return `${userName} foi desativado.`;
  if (status === 'blocked') return `${userName} foi bloqueado.`;
  return `${userName} foi excluído da app.`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}