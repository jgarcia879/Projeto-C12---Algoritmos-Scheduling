import { AlertCircle, CheckCircle2, Clock3, Gauge, ListChecks } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { CookCards } from './components/CookCards'
import { MetricCard } from './components/MetricCard'
import { OrderList } from './components/OrderList'
import { PerformanceStatus } from './components/PerformanceStatus'
import { SimulationChart } from './components/SimulationChart'
import { AlgorithmComparison } from './components/AlgorithmComparison'
import { SimulationControls } from './components/SimulationControls'
import { SimulationHistory } from './components/SimulationHistory'
import { ExpressSimulationLoading } from './components/ExpressSimulationLoading'
import { orders } from './services/simulationApi'
import { useSimulation } from './hooks/useSimulation'

function App() {
  const [cooks, setCooks] = useState(5)
  const [algorithm, setAlgorithm] = useState("FCFS")
  const [sharedGrill, setSharedGrill] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const { status, result, history, workers, liveOrders, errorMessage, expressProgress, execute, executeExpress } = useSimulation()
  const isLoading = status === 'loading'

  useEffect(() => {
    if (!isLoading) return

    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [isLoading])

  const displayedOrders = liveOrders.length > 0 ? liveOrders : orders

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-slate-100">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Header />

        <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:items-start">
          <div className="space-y-5">
            <SimulationControls
              cooks={cooks}
              loading={isLoading}
              onChange={setCooks}
              onRun={() => void execute(cooks, algorithm, sharedGrill)}
              onExpress={() => void executeExpress(algorithm)}
            />

            <section className="panel p-6 sm:p-8">
              <div className="eyebrow">Escalonamento de CPU · Terceira entrega</div>
              <h2 className="mt-3 text-xl font-bold">Ready Queue — fila de prontos</h2>
              <p className="mt-2 text-sm text-[#b9adad]">Cada pedido representa um processo. O escalonador define a ordem em que os cozinheiros retiram pedidos da fila.</p>
              <label className="mt-5 block text-sm font-semibold" htmlFor="algorithm">Algoritmo de escalonamento</label>
              <select id="algorithm" value={algorithm} disabled={isLoading} onChange={e => setAlgorithm(e.target.value)} className="mt-2 w-full rounded-lg border border-[#6a4848] bg-[#2d2021] p-3 text-[#f5f0e8]">
                <option value="FCFS">FCFS — ordem de chegada</option>
                <option value="SJF">SJF — menor tempo de preparo primeiro</option>
                <option value="PS">PS — prioridade dos pedidos</option>
              </select>
              <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={sharedGrill} disabled={isLoading} onChange={e => setSharedGrill(e.target.checked)} /> Chapa compartilhada (semáforo: apenas um cozinheiro por vez)</label>
              <p className="mt-3 text-xs text-[#b9adad]">{algorithm === 'PS' ? 'Prioridade 1 = alta; 2 = média; 3 = baixa. Empates seguem o ID.' : algorithm === 'SJF' ? 'Pedidos menores são retirados primeiro; sem preempção.' : 'Os pedidos são retirados por ordem de chegada (FIFO).'} {sharedGrill ? 'A chapa serializa o preparo, mesmo com várias threads.' : 'Sem chapa compartilhada, os cozinheiros podem preparar em paralelo.'}</p>
            </section>

            {status === 'error' && (
              <div role="alert" className="flex items-center gap-3 rounded-lg border border-[#8f5a55] bg-[#8e1b1b]/20 px-4 py-3 text-sm text-[#f0c4b7]">
                <AlertCircle size={18} />
                {errorMessage ?? 'Não foi possível executar a simulação. Tente novamente.'}
              </div>
            )}

            {(isLoading || workers.length > 0) && <CookCards workers={workers} orders={displayedOrders} now={now} />}

            {result ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Tempo total" value={`${result.duracaoSegundos.toFixed(2)}s`} detail="Duração real da execução" icon={Clock3} accent="red" />
                  <MetricCard label="Mínimo teórico" value={`${result.tempoMinimoTeorico.toFixed(2)}s`} detail="Pedido mais demorado da fila" icon={Gauge} accent="gold" />
                  <MetricCard label="Pedidos processados" value={`${result.pedidosProcessados} / ${result.quantidadePedidos}`} detail="Nenhum pedido ficou para trás" icon={ListChecks} accent="green" />
                  <MetricCard label="Diferença" value={`${result.diferencaPercentual.toFixed(2)}%`} detail={`${result.diferencaSegundos.toFixed(2)}s acima do mínimo`} icon={CheckCircle2} accent="green" />
                </div>
                <PerformanceStatus result={result} />
              </>
            ) : !isLoading ? (
              <div className="panel border-dashed p-8 text-center text-sm text-[#b9adad]">
                Configure a quantidade de cozinheiros e execute uma simulação real para visualizar os dados.
              </div>
            ) : null}

            <SimulationHistory history={history} />
          </div>

          <div className="space-y-5">
            <SimulationChart history={history} />
            <OrderList orders={displayedOrders} algorithm={algorithm} />
          </div>
        </div>

        <AlgorithmComparison history={history} />

        <footer className="mt-10 border-t border-[#493537] pt-5 text-xs text-[#847678]">
          Fonte dos resultados: Simulacao.java via API HTTP Java · nenhuma medição mockada
        </footer>
      </div>
      {expressProgress && <ExpressSimulationLoading progress={expressProgress} />}
    </main>
  )
}

export default App
