import { useState } from 'react';
import {
  Copy,
  LogIn,
  Plus,
  Shield,
  Trophy,
  Users,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { League } from '../types';
import { useLeagues } from '../lib/useLeagues';
import { useProfile } from '../lib/useProfile';

export function Leagues() {
  const { profile } = useProfile();
  const {
    leagues,
    isLoadingLeagues,
    leaguesError,
    addLeague,
    joinLeague,
    removeLeague,
  } = useLeagues();

  const [newLeagueName, setNewLeagueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleCreateLeague(event: React.FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const league = await addLeague(newLeagueName);

      setNewLeagueName('');
      setSuccessMessage(
        `Liga criada com sucesso. Código de convite: ${league.inviteCode}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar liga.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleJoinLeague(event: React.FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const league = await joinLeague(inviteCode);

      setInviteCode('');
      setSuccessMessage(`Entraste na liga ${league.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao entrar na liga.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLeaveLeague(league: League) {
    const confirmed = window.confirm(
      `Tens a certeza que queres sair da liga "${league.name}"?`
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      await removeLeague(league.id);

      setSuccessMessage(`Saíste da liga ${league.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao sair da liga.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function copyInviteCode(inviteCodeToCopy: string) {
    await navigator.clipboard.writeText(inviteCodeToCopy);
    setSuccessMessage(`Código ${inviteCodeToCopy} copiado.`);
    setErrorMessage('');
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Ligas</h2>
        <p className="text-sm text-slate-400">
          As ligas são grupos privados de ranking. O teu palpite é feito uma
          vez por jogo e conta para todas as ligas onde estás inscrito.
        </p>
      </div>

      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-cyan-100">
        <div className="flex gap-3">
          <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
            <Users size={20} />
          </div>

          <div>
            <h3 className="font-bold">Como funcionam as ligas?</h3>
            <p className="mt-1 text-sm text-cyan-100/80">
              Tu podes estar em várias ligas ao mesmo tempo. Não precisas
              escolher uma liga antes de palpitar. Cada palpite feito nos jogos
              será usado no ranking global e também nos rankings das tuas ligas.
            </p>
          </div>
        </div>
      </section>

      {(successMessage || errorMessage || leaguesError) && (
        <div className="space-y-3">
          {successMessage && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          {(errorMessage || leaguesError) && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errorMessage || leaguesError}
            </div>
          )}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        {profile?.isAdmin && (
          <form
            onSubmit={handleCreateLeague}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
                <Plus size={20} />
              </div>

              <div>
                <h3 className="font-bold">Criar nova liga</h3>
                <p className="text-sm text-slate-400">
                  Cria uma liga privada e partilha o código de convite.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nome da liga
            </label>

            <input
              value={newLeagueName}
              onChange={(event) => setNewLeagueName(event.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              placeholder="Ex: Liga Amigos"
            />

            <button
              type="submit"
              disabled={isSaving || !newLeagueName.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Shield size={18} />
              {isSaving ? 'A criar...' : 'Criar liga'}
            </button>
          </form>
        )}

        <form
          onSubmit={handleJoinLeague}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
              <LogIn size={20} />
            </div>

            <div>
              <h3 className="font-bold">Entrar numa liga</h3>
              <p className="text-sm text-slate-400">
                Usa o código de convite enviado por um admin.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Código de convite
          </label>

          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            className="mb-4 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
            placeholder="Ex: ABCD1234"
          />

          <button
            type="submit"
            disabled={isSaving || !inviteCode.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Users size={18} />
            {isSaving ? 'A entrar...' : 'Entrar na liga'}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">As minhas ligas</h3>
            <p className="text-sm text-slate-400">
              Estas são as ligas onde estás inscrito atualmente.
            </p>
          </div>
        </div>

        {isLoadingLeagues && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
            A carregar ligas...
          </div>
        )}

        {!isLoadingLeagues && leagues.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
            Ainda não estás em nenhuma liga. Entra com um código de convite ou
            pede ao admin para criar uma liga.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {leagues.map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              onCopyInviteCode={copyInviteCode}
              onLeaveLeague={handleLeaveLeague}
              isSaving={isSaving}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function LeagueCard({
  league,
  onCopyInviteCode,
  onLeaveLeague,
  isSaving,
}: {
  league: League;
  onCopyInviteCode: (inviteCode: string) => void;
  onLeaveLeague: (league: League) => void;
  isSaving: boolean;
}) {
  return (
    <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Estás nesta liga
          </p>
          <h4 className="mt-1 text-xl font-black">{league.name}</h4>
          <p className="mt-1 text-sm text-emerald-100/80">
            Os teus palpites contam para esta liga.
          </p>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
          <Trophy size={20} />
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-slate-950 p-4">
        <p className="text-sm text-slate-400">O teu papel nesta liga</p>
        <p className="mt-1 text-lg font-bold text-white">
          {league.myRole === 'owner' ? 'Admin da liga' : 'Membro'}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
        <p className="text-sm text-slate-400">Código de convite</p>
        <p className="mt-1 font-mono text-xl font-black text-white">
          {league.inviteCode}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          to={`/ranking?liga=${league.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
        >
          <BarChart3 size={18} />
          Ver ranking
        </Link>

        <button
          type="button"
          onClick={() => onCopyInviteCode(league.inviteCode)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15"
        >
          <Copy size={18} />
          Copiar código
        </button>

        <button
          type="button"
          onClick={() => onLeaveLeague(league)}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircle size={18} />
          Sair da liga
        </button>
      </div>
    </article>
  );
}