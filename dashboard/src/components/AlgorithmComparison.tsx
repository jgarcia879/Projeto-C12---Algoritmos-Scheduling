import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartNoAxesColumnIncreasing, Medal } from 'lucide-react'
import type { SimulationResult } from '../types/simulation'

const ALGORITHMS = [
  { id: 'FCFS', color: '#f26d5b', description: 'Ordem de chegada' },
  { id: 'SJF', color: '#64d5d0', description: 'Menor preparo primeiro' },
  { id: 'PS', color: '#f7c75d', description: 'Maior prioridade primeiro' },
] as const

type AlgorithmId = typeof ALGORITHMS[number]['id']

function AlgorithmComparisonScenario({ history, sharedGrill }: { history: SimulationResult[]; sharedGrill: boolean }) {
  const comparableHistory = history.filter((item) => item.chapaCompartilhada === sharedGrill)
  const summaries = ALGORITHMS.map((algorithm) => {
    const runs = comparableHistory.filter((item) => item.algoritmo === algorithm.id)
    const bestRun = runs.reduce<SimulationResult | null>((best, current) => !best || current.duracaoSegundos < best.duracaoSegundos ? current : best, null)
    const averageDuration = runs.length ? runs.reduce((sum, item) => sum + item.duracaoSegundos, 0) / runs.length : null
    const averageGap = runs.length ? runs.reduce((sum, item) => sum + item.diferencaPercentual, 0) / runs.length : null

    return { ...algorithm, runs, bestRun, averageDuration, averageGap, pairedWins: 0 }
  })

  const matchedConfigurations = Array.from(new Set(comparableHistory.map((item) => item.quantidadeCozinheiros)))
    .map((cooks) => comparableHistory.filter((item) => item.quantidadeCozinheiros === cooks))
    .filter((runs) => runs.length > 1)

  matchedConfigurations.forEach((runs) => {
    const bestDuration = Math.min(...runs.map((item) => item.duracaoSegundos))
    runs.filter((item) => Math.abs(item.duracaoSegundos - bestDuration) < 0.0001)
      .forEach((winner) => {
        const summary = summaries.find((item) => item.id === winner.algoritmo)
        if (summary) summary.pairedWins += 1
      })
  })

  const ranked = summaries.filter((item) => item.averageGap !== null).sort((a, b) => a.averageGap! - b.averageGap!)
  const leader = ranked[0]
  const chartData = summaries.filter((item) => item.averageGap !== null).map((item) => ({
    algorithm: item.id,
    overhead: item.averageGap!,
    fill: item.color,
  }))

  return <section className="panel mt-5 min-w-0 p-6 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="eyebrow"><ChartNoAxesColumnIncreasing size={14} /> Comparativo dos algoritmos</div>
        <h2 className="mt-3 text-xl font-bold text-[#f5f0e8]">{sharedGrill ? 'Com chapa compartilhada' : 'Sem chapa compartilhada'}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#b9adad]">
          {leader
            ? `${leader.id} apresenta a menor diferença média para o mínimo teórico (${leader.averageGap!.toFixed(1)}%) nas ${leader.runs.length} configuração(ões) registrada(s) neste cenário.`
            : 'Execute os algoritmos com a mesma quantidade de cozinheiros para começar uma comparação real.'}
        </p>
      </div>
      <span className="rounded-full border border-[#6a4848] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d8c9bd]">
        {sharedGrill ? 'Chapa compartilhada' : 'Preparo paralelo'}
      </span>
    </div>

    {comparableHistory.length === 0 ? <div className="mt-6 rounded-lg border border-dashed border-[#6a4848] px-5 py-8 text-center text-sm text-[#b9adad]">
      Ainda não há execuções neste cenário. Rode FCFS, SJF e PS com a mesma quantidade de cozinheiros para formar um comparativo pareado.
    </div> : <>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {summaries.map((summary) => <article key={summary.id} className="min-w-0 rounded-lg border border-[#493537] bg-[#2d2021]/55 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: summary.color }} />
              <h3 className="text-sm font-extrabold tracking-wide text-[#f5f0e8]">{summary.id}</h3>
            </div>
            {summary.pairedWins > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#f7c75d]"><Medal size={13} /> {summary.pairedWins} vitória(s)</span>}
          </div>
          <p className="mt-1 text-xs text-[#b9adad]">{summary.description}</p>
          {summary.runs.length ? <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div><span className="metric-label">Tempo médio</span><span className="metric-value">{summary.averageDuration!.toFixed(2)}s</span></div>
              <div><span className="metric-label">Acima do mínimo</span><span className="metric-value">{summary.averageGap!.toFixed(1)}%</span></div>
            </div>
            <p className="mt-4 border-t border-[#493537] pt-3 text-[11px] leading-5 text-[#b9adad]">
              Melhor registro: <strong className="text-[#f0e9df]">{summary.bestRun!.duracaoSegundos.toFixed(2)}s</strong> com {summary.bestRun!.quantidadeCozinheiros} cozinheiro(s) · {summary.runs.length} execução(ões)
            </p>
          </> : <p className="mt-5 text-xs text-[#927f80]">Sem execução registrada</p>}
        </article>)}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <div className="eyebrow">Distância do limite teórico</div>
          <h3 className="mt-2 text-base font-bold text-[#f5f0e8]">Diferença média por modelo</h3>
          <p className="mt-2 text-xs leading-5 text-[#b9adad]">Menor percentual indica tempo medido mais próximo do maior tempo individual de preparo.</p>
        </div>
        <div className="h-44 min-w-0 w-full">
          {chartData.length > 0 && <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ top: 2, right: 18, left: 12, bottom: 2 }}>
            <CartesianGrid stroke="#493537" strokeOpacity={0.6} horizontal={false} />
            <XAxis type="number" tick={{ fill: '#b9adad', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
            <YAxis type="category" dataKey="algorithm" width={42} tick={{ fill: '#f0e9df', fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#241a1b', border: '1px solid #6a4848', borderRadius: 8, color: '#f5f0e8' }} formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Acima do mínimo']} />
            <Bar dataKey="overhead" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart></ResponsiveContainer>}
        </div>
      </div>
      <p className="mt-4 border-t border-[#493537] pt-3 text-[10px] leading-5 text-[#927f80]">
        Médias calculadas apenas com execuções reais deste cenário. As vitórias contam somente configurações com mais de um algoritmo registrado; use o gráfico de tempo × cozinheiros acima para comparar os tempos na mesma configuração.
      </p>
    </>}
  </section>
}

export function AlgorithmComparison({ history }: { history: SimulationResult[] }) {
  return <div className="space-y-5">
    <AlgorithmComparisonScenario history={history} sharedGrill={false} />
    <AlgorithmComparisonScenario history={history} sharedGrill />
  </div>
}