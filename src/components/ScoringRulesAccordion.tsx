import { ChevronDown, ChevronRight, Info, Target, Trophy } from 'lucide-react';
import { useState } from 'react';

export function ScoringRulesAccordion() {
  const [isOpen, setIsOpen] = useState(false);

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
            <h3 className="text-lg font-bold">Regras de pontuação</h3>
            <p className="text-sm text-slate-400">
              Consulta como os pontos são atribuídos em cada jogo.
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
        <div className="space-y-4 border-t border-white/10 p-4">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-300">
              <Target size={18} />
              <h4 className="font-bold">Pontuação principal</h4>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <RuleCard
                points="5 pts"
                title="Placar exato"
                description="Acertar exatamente o resultado do jogo."
                example="Ex: palpite 2-1 e resultado 2-1."
              />

              <RuleCard
                points="3 pts"
                title="Resultado certo"
                description="Acertar vencedor ou empate, mesmo sem acertar o placar."
                example="Ex: palpite 2-1 e resultado 1-0."
              />

              <RuleCard
                points="+1 pt"
                title="Golo de equipa"
                description="Acertar os golos de uma das equipas."
                example="Ex: palpite 2-1 e resultado 2-0."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-300">
              <Info size={18} />
              <h4 className="font-bold">Exemplos práticos</h4>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <ExampleRow
                prediction="2 - 1"
                result="2 - 1"
                points="5 pts"
                reason="Placar exato."
              />

              <ExampleRow
                prediction="2 - 1"
                result="1 - 0"
                points="3 pts"
                reason="Vencedor correto, mas placar diferente."
              />

              <ExampleRow
                prediction="2 - 1"
                result="2 - 0"
                points="4 pts"
                reason="Vencedor correto e golos da equipa da casa corretos."
              />

              <ExampleRow
                prediction="1 - 1"
                result="0 - 0"
                points="3 pts"
                reason="Empate correto, mas placar diferente."
              />

              <ExampleRow
                prediction="1 - 0"
                result="0 - 2"
                points="0 pts"
                reason="Resultado errado e sem golos corretos."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Notas importantes</p>
            <p className="mt-2 text-amber-100/80">
              Os palpites só podem ser feitos ou editados antes do início do
              jogo. Jogos com equipas ainda por definir ficam bloqueados até os
              confrontos reais serem atualizados.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function RuleCard({
  points,
  title,
  description,
  example,
}: {
  points: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="rounded-xl bg-slate-950/70 p-4">
      <p className="text-2xl font-black text-emerald-300">{points}</p>
      <p className="mt-2 font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
        {example}
      </p>
    </div>
  );
}

function ExampleRow({
  prediction,
  result,
  points,
  reason,
}: {
  prediction: string;
  result: string;
  points: string;
  reason: string;
}) {
  return (
    <div className="grid gap-2 rounded-xl bg-white/5 p-3 sm:grid-cols-[1fr_1fr_auto_2fr] sm:items-center">
      <div>
        <p className="text-xs uppercase text-slate-500">Palpite</p>
        <p className="font-bold">{prediction}</p>
      </div>

      <div>
        <p className="text-xs uppercase text-slate-500">Resultado</p>
        <p className="font-bold">{result}</p>
      </div>

      <div>
        <p className="text-xs uppercase text-slate-500">Pontos</p>
        <p className="font-black text-emerald-300">{points}</p>
      </div>

      <p className="text-slate-400">{reason}</p>
    </div>
  );
}