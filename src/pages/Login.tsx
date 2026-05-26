import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Trophy } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';

type LoginMode = 'login' | 'signup';

export function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<LoginMode>('login');

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage('');

      if (mode === 'login') {
        await signIn({
          identifier,
          password,
        });
      } else {
        await signUp({
          name,
          username,
          password,
          timezone,
        });
      }

      navigate('/');
    } catch (error) {
      const message =
        error instanceof Error
          ? translateAuthError(error.message)
          : 'Erro ao autenticar.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setErrorMessage('');
    setPassword('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
            <Trophy size={30} />
          </div>

          <h1 className="text-3xl font-black">Mundial Palpites 2026</h1>
          <p className="mt-2 text-sm text-slate-400">
            Cria a tua conta, faz os teus palpites e compete com amigos.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-xl px-4 py-3 text-sm font-bold ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-xl px-4 py-3 text-sm font-bold ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              Criar conta
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Nome
                  </label>

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    placeholder="Ex: Daniel"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Username
                  </label>

                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    placeholder="Ex: daniel"
                    autoCapitalize="none"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Usa letras, números, ponto, hífen ou underscore. Não é
                    necessário email.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Fuso horário
                  </label>

                  <input
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    placeholder="Europe/Lisbon"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Detetado automaticamente pelo teu dispositivo.
                  </p>
                </div>
              </>
            )}

            {mode === 'login' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Username ou email
                </label>

                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  placeholder="Ex: daniel"
                  autoCapitalize="none"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Podes entrar com username. Contas antigas com email continuam
                  a funcionar.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isSaving
                ? mode === 'login'
                  ? 'A entrar...'
                  : 'A criar conta...'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Username/email ou password incorretos.';
  }

  if (normalized.includes('user already registered')) {
    return 'Este username já está registado.';
  }

  if (normalized.includes('password')) {
    return 'Verifica a password. Deve ter pelo menos 6 caracteres.';
  }

  return message;
}