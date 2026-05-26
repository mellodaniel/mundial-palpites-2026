import { useState } from 'react';
import { Clock, Mail, Save, User } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useProfile } from '../lib/useProfile';
import { getBrowserTimezone } from '../lib/timezone';

const COMMON_TIMEZONES = [
  'Europe/Lisbon',
  'Europe/Madrid',
  'Europe/London',
  'America/Sao_Paulo',
  'America/Fortaleza',
  'America/Manaus',
  'America/New_York',
  'America/Toronto',
  'America/Mexico_City',
  'America/Los_Angeles',
];

export function Profile() {
  const { user } = useAuth();
  const { profile, isLoadingProfile, profileError, saveTimezone } =
    useProfile();

  const [timezone, setTimezone] = useState(profile?.timezone ?? '');
  const [customTimezone, setCustomTimezone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentTimezone = profile?.timezone ?? 'Europe/Lisbon';
  const browserTimezone = getBrowserTimezone();

  async function handleUseBrowserTimezone() {
    setTimezone(browserTimezone);
    setCustomTimezone('');
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    const selectedTimezone = customTimezone.trim() || timezone || currentTimezone;

    if (!selectedTimezone) {
      setErrorMessage('Seleciona ou escreve um timezone válido.');
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      await saveTimezone(selectedTimezone);

      setTimezone(selectedTimezone);
      setCustomTimezone('');
      setSuccessMessage('Timezone atualizado com sucesso.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar timezone.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
        A carregar perfil...
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
        {profileError}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Perfil</h2>
        <p className="text-sm text-slate-400">
          Gere os teus dados e o horário usado para mostrar os jogos.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={<User />}
          label="Nome"
          value={profile?.name ?? 'Utilizador'}
        />

        <InfoCard
          icon={<Mail />}
          label="Email"
          value={user?.email ?? 'Email não disponível'}
        />

        <InfoCard
          icon={<Clock />}
          label="Timezone atual"
          value={currentTimezone}
        />

        <InfoCard
          icon={<Clock />}
          label="Timezone do browser"
          value={browserTimezone}
        />
      </section>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <div className="mb-5">
          <h3 className="text-lg font-bold">Alterar timezone</h3>
          <p className="mt-1 text-sm text-slate-400">
            Os jogos continuam guardados em UTC, mas serão exibidos no timezone
            escolhido aqui.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Timezone
            </label>

            <select
              value={timezone || currentTimezone}
              onChange={(event) => {
                setTimezone(event.target.value);
                setCustomTimezone('');
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
            >
              {COMMON_TIMEZONES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Ou escreve outro timezone
            </label>

            <input
              value={customTimezone}
              onChange={(event) => setCustomTimezone(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              placeholder="Ex: America/Sao_Paulo"
            />

            <p className="mt-2 text-xs text-slate-500">
              Usa nomes oficiais IANA, como Europe/Lisbon,
              America/Sao_Paulo ou America/New_York.
            </p>
          </div>

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

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleUseBrowserTimezone}
              disabled={isSaving}
              className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Usar timezone do browser
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Save size={18} />
              {isSaving ? 'A guardar...' : 'Guardar timezone'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-emerald-300">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-lg font-bold">{value}</p>
    </div>
  );
}