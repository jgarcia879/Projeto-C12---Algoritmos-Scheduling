import { ChefHat, Flame, Sparkles } from 'lucide-react'
import type { Order } from '../types/simulation'

interface LoadingSimulationProps {
  cooks: number
  activeOrder: Order
  queue: Order[]
}

export function LoadingSimulation({ cooks, activeOrder, queue }: LoadingSimulationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171112]/72 px-4 backdrop-blur-[2px]">
      <section className="panel w-full max-w-[440px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="prep-spinner" aria-hidden="true" />
            <div className="eyebrow">
              <Sparkles size={12} /> Preparando pedidos
            </div>
          </div>
          <span className="rounded-full border border-[#6b4848] bg-[#2d2021] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
            {cooks} cozinheiros
          </span>
        </div>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[#433536]">
          <div className="prep-progress h-full rounded-full" />
        </div>

        <div className="mt-5 rounded-xl border border-[#5d4140] bg-[#2d2021] p-4 shadow-inner shadow-black/10">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b9adad]">
              Pedido atual
            </span>
            <span className="text-[11px] font-black text-[#d9a441]">#{String(activeOrder.id).padStart(2, '0')}</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3d2527] text-[#f9c76d]">
              <Flame size={16} />
            </span>
            <div>
              <p className="text-base font-bold text-[#f5f0e8]">{activeOrder.dish}</p>
              <p className="text-[11px] text-[#cbb8b4]">{activeOrder.prepSeconds}s de preparo</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b9adad]">
            <ChefHat size={12} /> Próximos
          </div>

          <div className="flex flex-wrap gap-2">
            {queue.map((order) => (
              <span
                key={order.id}
                className="rounded-full border border-[#493537] bg-[#2d2021]/70 px-2.5 py-1 text-[11px] font-medium text-[#e7d8d2]"
              >
                {order.dish}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
