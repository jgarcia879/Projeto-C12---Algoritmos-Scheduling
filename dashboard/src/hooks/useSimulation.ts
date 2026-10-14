import { useState } from 'react'
import { runSimulation } from '../services/simulationApi'
import type { CookState, Order, OrderStatus, SimulationEvent, SimulationResult } from '../types/simulation'

type SimulationStatus = 'idle' | 'loading' | 'success' | 'error'

export function useSimulation() {
  const [status, setStatus] = useState<SimulationStatus>('idle')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [history, setHistory] = useState<SimulationResult[]>([])
  const [workers, setWorkers] = useState<CookState[]>([])
  const [liveOrders, setLiveOrders] = useState<Order[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateOrder(id: number, status: OrderStatus) {
    setLiveOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
  }

  function handleEvent(event: SimulationEvent) {
    if (event.tipo === 'PEDIDO_AGUARDANDO' && event.pedidoId && event.nomePrato && event.tempoPreparo !== undefined) {
      setLiveOrders((current) => [...current, {
        id: event.pedidoId!, dish: event.nomePrato!, prepSeconds: event.tempoPreparo!, status: 'AGUARDANDO', priority: event.prioridade,
      }])
    }
    if (event.tipo === 'AGUARDANDO_CHAPA' && event.pedidoId) {
      setWorkers((current) => current.map((worker) => worker.name === event.cozinheiro ? { ...worker, status: 'LIVRE', currentOrderId: event.pedidoId } : worker))
    }
    if (event.tipo === 'PEDIDO_INICIADO' && event.pedidoId) {
      updateOrder(event.pedidoId, 'PREPARANDO')
      setWorkers((current) => current.map((worker) => worker.name === event.cozinheiro
        ? { ...worker, status: 'PREPARANDO', currentOrderId: event.pedidoId, startedAt: event.instante }
        : worker))
    }
    if (event.tipo === 'PEDIDO_CONCLUIDO' && event.pedidoId) {
      updateOrder(event.pedidoId, 'CONCLUIDO')
      setWorkers((current) => current.map((worker) => worker.name === event.cozinheiro
        ? { ...worker, status: 'LIVRE', currentOrderId: undefined, startedAt: undefined }
        : worker))
    }
    if (event.tipo === 'SIMULACAO_CONCLUIDA') {
      setWorkers((current) => current.map((worker) => ({ ...worker, status: 'FINALIZADO', currentOrderId: undefined, startedAt: undefined })))
    }
  }

  async function execute(cooks: number, algorithm: string = "FCFS", sharedGrill: boolean = false) {
    setStatus('loading')
    setResult(null)
    setErrorMessage(null)
    setLiveOrders([])
    setWorkers(Array.from({ length: cooks }, (_, index) => ({
      id: index + 1, name: `COZINHEIRO ${index + 1}`, status: 'LIVRE',
    })))
    try {
      const nextResult = await runSimulation(cooks, handleEvent, algorithm, sharedGrill)
      setResult(nextResult)
      setHistory((current) => [...current.filter((item) => item.quantidadeCozinheiros !== cooks), nextResult].sort((a, b) => a.quantidadeCozinheiros - b.quantidadeCozinheiros))
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha desconhecida ao executar a simulacao.')
      setStatus('error')
    }
  }

  return { status, result, history, workers, liveOrders, errorMessage, execute }
}