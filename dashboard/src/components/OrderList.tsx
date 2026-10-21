import { ClipboardList, Timer } from 'lucide-react'
import type { Order } from '../types/simulation'

export function OrderList({ orders, algorithm = "FCFS" }: { orders: Order[]; algorithm?: string }) {
  const statusLabel = { AGUARDANDO: 'Aguardando', PREPARANDO: 'Preparando', CONCLUIDO: 'Concluído' }
  const sorted = [...orders].sort((a, b) => algorithm === 'SJF' ? a.prepSeconds - b.prepSeconds || a.id - b.id : algorithm === 'PS' ? (a.priority ?? (a.id - 1) % 3 + 1) - (b.priority ?? (b.id - 1) % 3 + 1) || a.id - b.id : a.id - b.id)
  const priorityInfo = {
    1: { label: 'Alta', tone: 'border-[#f7a93d]/70 bg-[#f7a93d]/15 text-[#ffd089]' },
    2: { label: 'Média', tone: 'border-[#5ac8fa]/60 bg-[#5ac8fa]/10 text-[#9edfff]' },
    3: { label: 'Baixa', tone: 'border-[#8bd08b]/60 bg-[#8bd08b]/10 text-[#c6f0c6]' }
  } as const

  return <section className="panel p-6 sm:p-8"><div className="eyebrow"><ClipboardList size={14} /> Fila de pedidos</div><div className="mt-3 flex items-end justify-between gap-4"><h2 className="text-xl font-bold text-[#f5f0e8]">Carga de trabalho</h2><span className="text-xs font-bold text-[#b9adad]">{orders.length} pedidos · {algorithm}</span></div><div className="mt-6 space-y-3">{sorted.map((order) => {
    const priorityValue = order.priority ?? ((order.id - 1) % 3 + 1)
    const priorityMeta = priorityInfo[priorityValue as keyof typeof priorityInfo] ?? priorityInfo[1]

    return <div key={order.id} className="rounded-lg border border-[#493537] bg-[#2d2021]/65 px-3 py-3 transition-colors duration-200 hover:bg-[#3a2425]"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="font-mono text-[10px] text-[#927f80]">#{String(order.id).padStart(2, '0')}</span><span className="truncate text-xs font-semibold uppercase tracking-[0.04em] text-[#f0e9df]">{order.dish}</span>{algorithm === "PS" && <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${priorityMeta.tone}`} title={`Prioridade ${priorityValue}: ${priorityMeta.label}`}>P{priorityValue} · {priorityMeta.label}</span>}</div><span className="ml-2 flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-[#c7bdb8]"><Timer size={12} />{order.prepSeconds}s</span></div><div className="load-bar mt-3"><span style={{ width: `${(order.prepSeconds / 8) * 100}%` }} /></div>{order.status && <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d9a441]">{statusLabel[order.status]}</div>}</div>
  })}</div></section>
}