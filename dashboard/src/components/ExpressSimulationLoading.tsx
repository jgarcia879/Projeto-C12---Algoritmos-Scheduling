import { Check, Sparkles } from 'lucide-react'
import type { ExpressProgress } from '../hooks/useSimulation'

const RUNS = [
  { cooks: 2, sharedGrill: false },
  { cooks: 2, sharedGrill: true },
  { cooks: 8, sharedGrill: false },
  { cooks: 8, sharedGrill: true },
  { cooks: 20, sharedGrill: false },
  { cooks: 20, sharedGrill: true },
]

function describeRun(cooks: number, sharedGrill: boolean) {
  return `${cooks} threads · ${sharedGrill ? 'com chapa' : 'sem chapa'}`
}

export function ExpressSimulationLoading({ progress }: { progress: ExpressProgress }) {
  const progressPercent = (progress.completedRuns / progress.totalRuns) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171112]/85 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="express-loading-title">
      <section className="panel w-full max-w-lg p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="prep-spinner mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <div className="eyebrow"><Sparkles size={13} /> Rodada automatizada</div>
            <h2 id="express-loading-title" className="mt-2 text-xl font-bold text-[#f5f0e8]">Simulação express</h2>
            <p className="mt-1 text-sm text-[#b9adad]">{progress.algorithm} · preparo acelerado a 2% do tempo normal</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#d9ceca]" aria-live="polite">
          <span>Execução {Math.min(progress.completedRuns + 1, progress.totalRuns)} de {progress.totalRuns}</span>
          <span>{Math.round(progressPercent)}% concluído</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#433536]">
          <div className="h-full rounded-full bg-[#d9a441] transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="mt-5 border-t border-[#493537] pt-2">
          {RUNS.map((run, index) => {
            const completed = index < progress.completedRuns
            const current = index === progress.completedRuns
            return (
              <div key={`${run.cooks}-${run.sharedGrill}`} className={`flex min-h-10 items-center justify-between border-b border-[#493537]/70 text-sm ${current ? 'text-[#f9c76d]' : completed ? 'text-[#b9adad]' : 'text-[#796c6d]'}`}>
                <span>{describeRun(run.cooks, run.sharedGrill)}</span>
                {completed ? <Check size={15} aria-label="Concluída" /> : current ? <span className="h-2 w-2 animate-pulse rounded-full bg-[#d9a441]" aria-label="Em execução" /> : <span className="text-xs tabular-nums">{index + 1}</span>}
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#927f80]">As medições entram nos gráficos por cenário à medida que cada execução termina.</p>
      </section>
    </div>
  )
}
