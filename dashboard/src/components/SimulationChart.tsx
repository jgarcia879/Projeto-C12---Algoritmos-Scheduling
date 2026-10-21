import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LineChart } from 'lucide-react'
import type { SimulationResult } from '../types/simulation'

const ALGORITHM_COLORS: Record<string, string> = {
  FCFS: '#f26d5b',
  SJF: '#64d5d0',
  PS: '#f7c75d',
}

function SimulationChartScenario({ history, sharedGrill }: { history: SimulationResult[]; sharedGrill: boolean }) {
  const algorithms = ['FCFS', 'SJF', 'PS'] as const
  const comparableHistory = history.filter((item) => item.chapaCompartilhada === sharedGrill)
  const minimum = comparableHistory[0]?.tempoMinimoTeorico ?? 8
  const legendItems = algorithms.map((item) => ({ label: item, color: ALGORITHM_COLORS[item] }))

  const data = Array.from(new Set(comparableHistory.map((item) => item.quantidadeCozinheiros)))
    .sort((a, b) => a - b)
    .map((cooks) => {
      const row: Record<string, number | string> = { cooks }
      algorithms.forEach((alg) => {
        const match = comparableHistory.filter((item) => item.quantidadeCozinheiros === cooks && item.algoritmo === alg)
          .sort((a, b) => a.duracaoSegundos - b.duracaoSegundos)
        row[alg] = match[0]?.duracaoSegundos ?? null
      })
      return row
    })

  return <section className="panel min-w-0 p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow"><LineChart size={14} /> {sharedGrill ? 'Com chapa compartilhada' : 'Sem chapa compartilhada'}</div><h2 className="mt-3 text-xl font-bold text-[#f5f0e8]">Tempo × cozinheiros</h2></div><div className="flex flex-wrap items-center gap-2 text-xs text-[#b9adad]">
    {legendItems.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span>{item.label}</span>
      </div>
    ))}
    <span className="ml-1 h-px w-4 bg-[#d9a441]" />
    <span>mínimo teórico</span>
  </div></div>{data.length ? <div className="mt-8 h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#493537" strokeOpacity={0.6} vertical={false} /><XAxis dataKey="cooks" tick={{ fill: '#b9adad', fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fill: '#b9adad', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}s`} /><Tooltip contentStyle={{ background: '#241a1b', border: '1px solid #6a4848', borderRadius: 8, color: '#f5f0e8' }} labelFormatter={(value) => `${value} cozinheiro(s)`} formatter={(value, name) => [value === null || value === undefined ? '—' : `${Number(value).toFixed(2)}s`, `${String(name)}`]} /><ReferenceLine y={minimum} stroke="#d9a441" strokeDasharray="4 5" />{algorithms.map((alg) => (
      <Area key={alg} type="monotone" dataKey={alg} stroke={ALGORITHM_COLORS[alg]} strokeWidth={2} fill={ALGORITHM_COLORS[alg]} fillOpacity={0.12} connectNulls dot={{ fill: ALGORITHM_COLORS[alg], r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f5f0e8', stroke: ALGORITHM_COLORS[alg], strokeWidth: 2 }} />
    ))}</AreaChart></ResponsiveContainer></div> : <div className="mt-8 flex h-40 items-center justify-center border-t border-dashed border-[#493537] text-sm text-[#927f80]">Nenhuma execução registrada neste modo.</div>}</section>
}

export function SimulationChart({ history }: { history: SimulationResult[] }) {
  return <div className="space-y-5">
    <SimulationChartScenario history={history} sharedGrill={false} />
    <SimulationChartScenario history={history} sharedGrill />
  </div>
}