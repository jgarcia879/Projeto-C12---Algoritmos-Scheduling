import { CheckCircle2, ChefHat, Flame, Timer } from 'lucide-react'
import type { CookState, Order } from '../types/simulation'

interface Props {
  workers: CookState[]
  orders: Order[]
  now: number
}

export function CookCards({ workers, orders, now }: Props) {
  return <section className="space-y-4">
    <div>
      <div className="eyebrow"><ChefHat size={14} /> Cozinheiros em atividade</div>
      <h2 className="mt-3 text-xl font-bold text-[#f5f0e8]">Processamento paralelo</h2>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {workers.map((worker) => {
        const order = orders.find((item) => item.id === worker.currentOrderId)
        const elapsed = order && worker.startedAt !== undefined
          ? Math.max(0, (now - worker.startedAt) / 1000)
          : 0
        const progress = order ? Math.min(100, (elapsed / order.prepSeconds) * 100) : 0
        const isPreparing = worker.status === 'PREPARANDO' && order

        return <article key={worker.id} className="panel min-h-52 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#f5f0e8]"><ChefHat size={17} className="text-[#d9a441]" />{worker.name}</div>
            <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isPreparing ? 'bg-[#c62828]/15 text-[#f0c4b7]' : 'bg-[#6f8f72]/15 text-[#b4c3b0]'}`}>
              {isPreparing ? 'Preparando' : worker.status === 'FINALIZADO' ? 'Finalizado' : 'Livre'}
            </span>
          </div>

          {order ? <>
            <div className="mt-6 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3d2527] text-[#f9c76d]"><Flame size={17} /></span>
              <div className="min-w-0"><p className="text-base font-bold text-[#f5f0e8]">Pedido #{String(order.id).padStart(2, '0')}</p><p className="truncate text-sm text-[#cbb8b4]">{order.dish}</p></div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#453536]"><span className="block h-full rounded-full bg-[#c62828] transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
            <div className="mt-2 flex items-center justify-between text-[11px] tabular-nums text-[#b9adad]"><span><Timer size={12} className="mr-1 inline" />{elapsed.toFixed(1)}s / {order.prepSeconds}s</span><span>{progress.toFixed(0)}%</span></div>
          </> : <div className="flex min-h-32 flex-col items-center justify-center text-center text-sm text-[#b9adad]"><CheckCircle2 size={24} className="mb-2 text-[#6f8f72]" /><span>{worker.status === 'FINALIZADO' ? 'Simulação concluída' : 'Nenhum pedido disponível'}</span></div>}
        </article>
      })}
    </div>
  </section>
}
