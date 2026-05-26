import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Calculator,
  RefreshCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trophy,
  Upload,
  GitBranch,
  Save,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { AdminUsersManagement } from '../components/AdminUsersManagement';
import { useMatches } from '../lib/useMatches';
import {
  finishMatchAndRecalculatePoints,
  importMatchesFromJson,
  reopenMatch,
  updateKnockoutMatchTeams,
} from '../lib/adminApi';
import type { MatchImportItem } from '../types';

type StatusFilter = 'all' | 'scheduled' | 'finished';

const KNOCKOUT_STAGES = [
  'Ronda de 32',
  'Ronda de 16',
  'Quartos de Final',
  'Meia-final',
  '3.º lugar',
  'Final',
];

export function Admin() {
  const { matches, isLoadingMatches, matchesError } = useMatches();

  const [openSections, setOpenSections] = useState<string[]>([
    'summary',
    'knockout',
  ]);

  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const [selectedKnockoutMatchId, setSelectedKnockoutMatchId] = useState('');
  const [knockoutHomeTeam, setKnockoutHomeTeam] = useState('');
  const [knockoutAwayTeam, setKnockoutAwayTeam] = useState('');
  const [knockoutHomeTeamCode, setKnockoutHomeTeamCode] = useState('');
  const [knockoutAwayTeamCode, setKnockoutAwayTeamCode] = useState('');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [jsonImportText, setJsonImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingKnockout, setIsSavingKnockout] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const groupOptions = useMemo(() => {
    const groups = new Set<string>();

    for (const match of matches) {
      groups.add(match.groupName || match.stage || 'Outros jogos');
    }

    return Array.from(groups).sort((a, b) => a.localeCompare(b));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return matches.filter((match) => {
      const matchStatus =
        match.status === 'finished' ? 'finished' : 'scheduled';

      const matchesStatus =
        statusFilter === 'all' || statusFilter === matchStatus;

      const matchGroup = match.groupName || match.stage || 'Outros jogos';
      const matchesGroup = groupFilter === 'all' || groupFilter === matchGroup;

      const matchesSearch =
        !normalizedSearch ||
        match.homeTeam.toLowerCase().includes(normalizedSearch) ||
        match.awayTeam.toLowerCase().includes(normalizedSearch) ||
        match.homeTeamCode?.toLowerCase().includes(normalizedSearch) ||
        match.awayTeamCode?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesGroup && matchesSearch;
    });
  }, [matches, statusFilter, groupFilter, searchTerm]);

  const knockoutMatches = useMemo(
    () =>
      matches
        .filter((match) => KNOCKOUT_STAGES.includes(match.stage))
        .sort((a, b) => a.matchNumber - b.matchNumber),
    [matches]
  );

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedMatchId),
    [matches, selectedMatchId]
  );

  const selectedKnockoutMatch = useMemo(
    () => knockoutMatches.find((match) => match.id === selectedKnockoutMatchId),
    [knockoutMatches, selectedKnockoutMatchId]
  );

  const totalFinished = matches.filter(
    (match) => match.status === 'finished'
  ).length;

  const totalScheduled = matches.length - totalFinished;

  function toggleSection(sectionId: string) {
    setOpenSections((current) =>
      current.includes(sectionId)
        ? current.filter((item) => item !== sectionId)
        : [...current, sectionId]
    );
  }

  function openAllSections() {
    setOpenSections(['summary', 'knockout', 'import', 'filters', 'results']);
  }

  function closeAllSections() {
    setOpenSections([]);
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchId(matchId);
    setSuccessMessage('');
    setErrorMessage('');

    const match = matches.find((item) => item.id === matchId);

    setHomeScore(match?.homeScore?.toString() ?? '');
    setAwayScore(match?.awayScore?.toString() ?? '');
  }

  function handleSelectKnockoutMatch(matchId: string) {
    setSelectedKnockoutMatchId(matchId);
    setSuccessMessage('');
    setErrorMessage('');

    const match = knockoutMatches.find((item) => item.id === matchId);

    setKnockoutHomeTeam(
      isPlaceholderTeam(match?.homeTeam) ? '' : match?.homeTeam ?? ''
    );
    setKnockoutAwayTeam(
      isPlaceholderTeam(match?.awayTeam) ? '' : match?.awayTeam ?? ''
    );
    setKnockoutHomeTeamCode(match?.homeTeamCode ?? '');
    setKnockoutAwayTeamCode(match?.awayTeamCode ?? '');
  }

  function clearKnockoutForm() {
    setSelectedKnockoutMatchId('');
    setKnockoutHomeTeam('');
    setKnockoutAwayTeam('');
    setKnockoutHomeTeamCode('');
    setKnockoutAwayTeamCode('');
    setSuccessMessage('');
    setErrorMessage('');
  }

  function clearResultForm() {
    setSelectedMatchId('');
    setHomeScore('');
    setAwayScore('');
    setSuccessMessage('');
    setErrorMessage('');
  }

  async function handleFinishMatch(event: FormEvent) {
    event.preventDefault();

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (!selectedMatchId) {
      setErrorMessage('Seleciona um jogo.');
      return;
    }

    if (
      homeScore === '' ||
      awayScore === '' ||
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore) ||
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      setErrorMessage('Insere um resultado válido.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const result = await finishMatchAndRecalculatePoints({
        matchId: selectedMatchId,
        homeScore: parsedHomeScore,
        awayScore: parsedAwayScore,
      });

      setSuccessMessage(
        `Resultado guardado e ${result.updatedPredictions} palpite(s) recalculado(s).`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao guardar resultado.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReopenMatch() {
    if (!selectedMatchId) {
      setErrorMessage('Seleciona um jogo.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await reopenMatch({
        matchId: selectedMatchId,
      });

      setHomeScore('');
      setAwayScore('');
      setSuccessMessage('Jogo reaberto e pontuações limpas.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao reabrir jogo.';

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImportMatches() {
    try {
      setIsImporting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const parsed = JSON.parse(jsonImportText) as MatchImportItem[];

      const result = await importMatchesFromJson(parsed);

      setJsonImportText('');
      setSuccessMessage(`${result.importedMatches} jogo(s) importado(s).`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao importar jogos. Verifica o formato do JSON.';

      setErrorMessage(message);
    } finally {
      setIsImporting(false);
    }
  }

  async function handleUpdateKnockoutTeams(event: FormEvent) {
    event.preventDefault();

    if (!selectedKnockoutMatchId) {
      setErrorMessage('Seleciona um jogo eliminatório.');
      return;
    }

    try {
      setIsSavingKnockout(true);
      setErrorMessage('');
      setSuccessMessage('');

      await updateKnockoutMatchTeams({
        matchId: selectedKnockoutMatchId,
        homeTeam: knockoutHomeTeam,
        awayTeam: knockoutAwayTeam,
        homeTeamCode: knockoutHomeTeamCode,
        awayTeamCode: knockoutAwayTeamCode,
      });

      setSuccessMessage(
        'Confronto atualizado. O palpite será desbloqueado automaticamente se o jogo ainda não começou.'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar confronto.';

      setErrorMessage(message);
    } finally {
      setIsSavingKnockout(false);
    }
  }

  function resetFilters() {
    setStatusFilter('all');
    setGroupFilter('all');
    setSearchTerm('');
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black">Admin</h2>
        <p className="text-sm text-slate-400">
          Área para importar jogos, atualizar eliminatórias, inserir resultados,
          reabrir jogos e recalcular pontuações.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openAllSections}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
        >
          Abrir tudo
        </button>

        <button
          type="button"
          onClick={closeAllSections}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
        >
          Fechar tudo
        </button>
      </div>

      {isLoadingMatches && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          A carregar jogos...
        </div>
      )}

      {matchesError && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {matchesError}
        </div>
      )}

      {!isLoadingMatches && !matchesError && (
        <>
          <Messages successMessage={successMessage} errorMessage={errorMessage} />

          <AdminUsersManagement />

          <AdminSection
            id="summary"
            title="Resumo"
            description="Visão geral rápida dos jogos carregados."
            icon={<Trophy size={20} />}
            isOpen={openSections.includes('summary')}
            onToggle={toggleSection}
          >
            <section className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={<Trophy />}
                label="Total de jogos"
                value={String(matches.length)}
              />
              <SummaryCard
                icon={<Clock />}
                label="Por finalizar"
                value={String(totalScheduled)}
              />
              <SummaryCard
                icon={<CheckCircle2 />}
                label="Finalizados"
                value={String(totalFinished)}
              />
            </section>
          </AdminSection>

          <AdminSection
            id="knockout"
            title="Atualizar confrontos das eliminatórias"
            description="Atualiza as equipas reais quando os classificados forem conhecidos."
            icon={<GitBranch size={20} />}
            isOpen={openSections.includes('knockout')}
            onToggle={toggleSection}
          >
            <form onSubmit={handleUpdateKnockoutTeams} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Jogo eliminatório
                </label>

                <select
                  value={selectedKnockoutMatchId}
                  onChange={(event) =>
                    handleSelectKnockoutMatch(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="">Selecionar jogo eliminatório</option>
                  {knockoutMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.matchNumber} · {match.stage} · {match.homeTeam} x{' '}
                      {match.awayTeam}
                    </option>
                  ))}
                </select>
              </div>

              {selectedKnockoutMatch && (
                <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Jogo selecionado</p>
                  <p className="mt-1 text-lg font-bold">
                    #{selectedKnockoutMatch.matchNumber} ·{' '}
                    {selectedKnockoutMatch.stage}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Atual: {selectedKnockoutMatch.homeTeam} x{' '}
                    {selectedKnockoutMatch.awayTeam}
                  </p>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <TeamInput
                  label="Equipa da casa"
                  team={knockoutHomeTeam}
                  code={knockoutHomeTeamCode}
                  onTeamChange={setKnockoutHomeTeam}
                  onCodeChange={setKnockoutHomeTeamCode}
                />

                <TeamInput
                  label="Equipa visitante"
                  team={knockoutAwayTeam}
                  code={knockoutAwayTeamCode}
                  onTeamChange={setKnockoutAwayTeam}
                  onCodeChange={setKnockoutAwayTeamCode}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={isSavingKnockout || !selectedKnockoutMatchId}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  <Save size={18} />
                  {isSavingKnockout ? 'A guardar...' : 'Guardar confronto'}
                </button>

                <button
                  type="button"
                  onClick={clearKnockoutForm}
                  disabled={isSavingKnockout}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle size={18} />
                  Limpar seleção
                </button>
              </div>
            </form>
          </AdminSection>

          <AdminSection
            id="import"
            title="Importar jogos por JSON"
            description="Cria ou atualiza jogos usando o externalId."
            icon={<Upload size={20} />}
            isOpen={openSections.includes('import')}
            onToggle={toggleSection}
          >
            <textarea
              value={jsonImportText}
              onChange={(event) => setJsonImportText(event.target.value)}
              className="min-h-40 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-emerald-400"
              placeholder={`[
  {
    "externalId": "fifa-2026-001",
    "matchNumber": 1,
    "stage": "Fase de Grupos",
    "groupName": "Grupo A",
    "homeTeam": "México",
    "awayTeam": "África do Sul",
    "homeTeamCode": "MEX",
    "awayTeamCode": "RSA",
    "stadium": "Mexico City Stadium",
    "city": "Cidade do México",
    "country": "México",
    "kickoffUtc": "2026-06-11T19:00:00Z",
    "source": "fifa"
  }
]`}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleImportMatches}
                disabled={isImporting || !jsonImportText.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                <Upload size={18} />
                {isImporting ? 'A importar...' : 'Importar jogos'}
              </button>

              <button
                type="button"
                onClick={() => setJsonImportText('')}
                disabled={isImporting || !jsonImportText.trim()}
                className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Limpar JSON
              </button>
            </div>
          </AdminSection>

          <AdminSection
            id="filters"
            title="Filtros"
            description="Encontra rapidamente jogos por equipa, estado ou fase."
            icon={<Filter size={20} />}
            isOpen={openSections.includes('filters')}
            onToggle={toggleSection}
          >
            <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Pesquisar equipa
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
                    placeholder="Portugal, Brasil, MEX..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="all">Todos</option>
                  <option value="scheduled">Por finalizar</option>
                  <option value="finished">Finalizados</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Grupo/Fase
                </label>
                <select
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="all">Todos</option>
                  {groupOptions.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15"
                >
                  Limpar
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {filteredMatches.length} jogo(s) encontrado(s).
            </p>
          </AdminSection>

          <AdminSection
            id="results"
            title="Inserir resultado final"
            description="Guardar resultados e recalcular pontos dos palpites."
            icon={<Calculator size={20} />}
            isOpen={openSections.includes('results')}
            onToggle={toggleSection}
          >
            <form onSubmit={handleFinishMatch} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Jogo
                </label>

                <select
                  value={selectedMatchId}
                  onChange={(event) => handleSelectMatch(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="">Selecionar jogo</option>
                  {filteredMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.matchNumber} ·{' '}
                      {match.groupName || match.stage || 'Sem grupo'} ·{' '}
                      {match.homeTeam} x {match.awayTeam}
                      {match.status === 'finished'
                        ? ` · ${match.homeScore}-${match.awayScore}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMatch && (
                <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">
                        Jogo selecionado
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {selectedMatch.homeTeam} x {selectedMatch.awayTeam}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        #{selectedMatch.matchNumber} ·{' '}
                        {selectedMatch.groupName || selectedMatch.stage}
                      </p>
                    </div>

                    <StatusBadge status={selectedMatch.status} />
                  </div>

                  {selectedMatch.status === 'finished' && (
                    <div className="mt-4 rounded-xl bg-white/5 px-4 py-3">
                      <p className="text-sm text-slate-400">Resultado atual</p>
                      <p className="mt-1 text-xl font-black">
                        {selectedMatch.homeTeam} {selectedMatch.homeScore} -{' '}
                        {selectedMatch.awayScore} {selectedMatch.awayTeam}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    {selectedMatch?.homeTeam ?? 'Casa'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(event) => setHomeScore(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-center text-xl font-bold text-white outline-none focus:border-emerald-400"
                    placeholder="0"
                  />
                </div>

                <div className="pt-7 text-sm font-bold text-slate-400">x</div>

                <div>
                  <label className="mb-2 block text-right text-sm font-medium text-slate-300">
                    {selectedMatch?.awayTeam ?? 'Fora'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(event) => setAwayScore(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-center text-xl font-bold text-white outline-none focus:border-emerald-400"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isSaving ? 'A guardar...' : 'Guardar resultado e recalcular'}
                </button>

                <button
                  type="button"
                  onClick={handleReopenMatch}
                  disabled={isSaving || !selectedMatchId}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw size={18} />
                  Reabrir jogo
                </button>

                <button
                  type="button"
                  onClick={clearResultForm}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle size={18} />
                  Limpar seleção
                </button>
              </div>
            </form>
          </AdminSection>
        </>
      )}
    </div>
  );
}

function AdminSection({
  id,
  title,
  description,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: (sectionId: string) => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            {icon}
          </div>

          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>

        {isOpen ? (
          <ChevronDown className="text-emerald-300" />
        ) : (
          <ChevronRight className="text-slate-400" />
        )}
      </button>

      {isOpen && <div className="border-t border-white/10 p-5">{children}</div>}
    </section>
  );
}

function Messages({
  successMessage,
  errorMessage,
}: {
  successMessage: string;
  errorMessage: string;
}) {
  if (!successMessage && !errorMessage) {
    return null;
  }

  return (
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
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-emerald-300">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function TeamInput({
  label,
  team,
  code,
  onTeamChange,
  onCodeChange,
}: {
  label: string;
  team: string;
  code: string;
  onTeamChange: (value: string) => void;
  onCodeChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        value={team}
        onChange={(event) => onTeamChange(event.target.value)}
        className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
        placeholder="Ex: Portugal"
      />

      <label className="mb-2 block text-sm font-medium text-slate-300">
        Código
      </label>

      <input
        value={code}
        maxLength={3}
        onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
        placeholder="Ex: POR"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
        <CheckCircle2 size={14} />
        Finalizado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
      <Clock size={14} />
      Por finalizar
    </span>
  );
}

function isPlaceholderTeam(teamName?: string) {
  const normalized = teamName?.trim().toLowerCase() ?? '';

  if (!normalized) return true;

  const placeholderPatterns = [
    'a definir',
    'grupo',
    'vencedor',
    'perdedor',
    '1.º',
    '2.º',
    '3.º',
    '1º',
    '2º',
    '3º',
    'winner',
    'runner-up',
    'third',
  ];

  return placeholderPatterns.some((pattern) => normalized.includes(pattern));
}