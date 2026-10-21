import { useState } from 'react'
import { ensureExpressSupport, runSimulation } from '../services/simulationApi'
import type { CookState, Order, OrderStatus, SimulationEvent, SimulationResult } from '../types/simulation'

type SimulationStatus = 'idle' | 'loading' | 'success' | 'error'
export interface ExpressProgress {
  completedRuns: number
  totalRuns: number
  cooks: number
  sharedGrill: boolean
  algorithm: string
}

const EXPRESS_CONFIGURATIONS = [2, 8, 20].flatMap((cooks) => [
  { cooks, sharedGrill: false },
  { cooks, sharedGrill: true },
])
const EXPRESS_TIME_SCALE = 0.02

export function useSimulation() {
  const [status, setStatus] = useState<SimulationStatus>('idle')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [history, setHistory] = useState<SimulationResult[]>([])
  const [workers, setWorkers] = useState<CookState[]>([])
  const [liveOrders, setLiveOrders] = useState<Order[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expressProgress, setExpressProgress] = useState<ExpressProgress | null>(null)

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
    setExpressProgress(null)
    setStatus('loading')
    setResult(null)
    setErrorMessage(null)
    setLiveOrders([])
    setWorkers(Array.from({ length: cooks }, (_, index) => ({
      id: index + 1, name: `COZINHEIRO ${index + 1}`, status: 'LIVRE',
    })))
    try {
      const nextResult = { ...(await runSimulation(cooks, handleEvent, algorithm, sharedGrill)), chapaCompartilhada: sharedGrill }
      setResult(nextResult)
      setHistory((current) => [...current.filter((item) => item.quantidadeCozinheiros !== cooks || item.algoritmo !== algorithm || item.chapaCompartilhada !== sharedGrill), nextResult].sort((a, b) => a.chapaCompartilhada === b.chapaCompartilhada ? a.quantidadeCozinheiros - b.quantidadeCozinheiros || a.algoritmo.localeCompare(b.algoritmo) : Number(a.chapaCompartilhada) - Number(b.chapaCompartilhada)))
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha desconhecida ao executar a simulacao.')
      setStatus('error')
    }
  }

  async function executeExpress(algorithm: string = "FCFS") {
    setStatus('loading')
    setResult(null)
    setErrorMessage(null)
    setLiveOrders([])
    setWorkers([])

    try {
      await ensureExpressSupport()
      for (let index = 0; index < EXPRESS_CONFIGURATIONS.length; index += 1) {
        const configuration = EXPRESS_CONFIGURATIONS[index]
        setExpressProgress({
          completedRuns: index,
          totalRuns: EXPRESS_CONFIGURATIONS.length,
          ...configuration,
          algorithm,
        })
        setLiveOrders([])
        setWorkers(Array.from({ length: configuration.cooks }, (_, workerIndex) => ({
          id: workerIndex + 1,
          name: `COZINHEIRO ${workerIndex + 1}`,
          status: 'LIVRE' as const,
        })))

        const result = {
          ...(await runSimulation(configuration.cooks, handleEvent, algorithm, configuration.sharedGrill, EXPRESS_TIME_SCALE)),
          chapaCompartilhada: configuration.sharedGrill,
        }
        setResult(result)
        setHistory((current) => [...current.filter((item) => item.quantidadeCozinheiros !== configuration.cooks
          || item.algoritmo !== algorithm
          || item.chapaCompartilhada !== configuration.sharedGrill), result]
          .sort((a, b) => a.chapaCompartilhada === b.chapaCompartilhada
            ? a.quantidadeCozinheiros - b.quantidadeCozinheiros || a.algoritmo.localeCompare(b.algoritmo)
            : Number(a.chapaCompartilhada) - Number(b.chapaCompartilhada)))
        setExpressProgress({
          completedRuns: index + 1,
          totalRuns: EXPRESS_CONFIGURATIONS.length,
          ...configuration,
          algorithm,
        })
      }
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha desconhecida ao executar a simulacao express.')
      setStatus('error')
    } finally {
      setExpressProgress(null)
    }
  }

  return { status, result, history, workers, liveOrders, errorMessage, expressProgress, execute, executeExpress }
}