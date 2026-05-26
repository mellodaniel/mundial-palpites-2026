import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../lib/auth';
import { useAuth } from '../lib/useAuth';

export function Login() {
  const { user, isLoadingAuth } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoadingAuth && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Indica o teu nome.');
        }

        await signUpWithEmail(name.trim(), email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro. Tenta novamente.';

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
            <Trophy size={30} />
          </div>

          <h1 className="text-2xl font-black">Mundial Palpites 2026</h1>
          <p className="mt-2 text-sm text-slate-400">
            Entra, faz os teus palpites e compete com os amigos.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              mode === 'login'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300'
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              mode === 'register'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nome
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                placeholder="O teu nome"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              placeholder="teu@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              placeholder="********"
              required
              minLength={6}
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSubmitting
              ? 'A processar...'
              : mode === 'login'
              ? 'Entrar'
              : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}