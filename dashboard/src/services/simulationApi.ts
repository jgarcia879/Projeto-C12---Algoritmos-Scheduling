import type { Order, SimulationEvent, SimulationResult } from '../types/simulation'

export const orders: Order[] = [
  { id: 1, dish: 'Hambúrguer', prepSeconds: 3 }, { id: 2, dish: 'Batata frita', prepSeconds: 1 },
  { id: 3, dish: 'Pizza', prepSeconds: 5 }, { id: 4, dish: 'Lasanha', prepSeconds: 7 },
  { id: 5, dish: 'Hot dog', prepSeconds: 2 }, { id: 6, dish: 'Salada', prepSeconds: 2 },
  { id: 7, dish: 'Sopa', prepSeconds: 4 }, { id: 8, dish: 'Macarrão', prepSeconds: 6 },
  { id: 9, dish: 'Tacos', prepSeconds: 3 }, { id: 10, dish: 'Risoto', prepSeconds: 5 },
  { id: 11, dish: 'Nuggets', prepSeconds: 2 }, { id: 12, dish: 'Bife acebolado', prepSeconds: 8 },
  { id: 13, dish: 'Panqueca', prepSeconds: 4 }, { id: 14, dish: 'Sanduíche', prepSeconds: 1 },
  { id: 15, dish: 'Peixe grelhado', prepSeconds: 6 }, { id: 16, dish: 'Coxinha', prepSeconds: 2 },
  { id: 17, dish: 'Escondidinho', prepSeconds: 5 }, { id: 18, dish: 'Wrap', prepSeconds: 3 },
  { id: 19, dish: 'Calzone', prepSeconds: 7 }, { id: 20, dish: 'Brownie', prepSeconds: 4 },
]

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function runSimulation(
  cooks: number,
  onEvent: (event: SimulationEvent) => void,
  algorithm: string = "FCFS",
  sharedGrill: boolean = false,
): Promise<SimulationResult> {
  const response = await fetch(`${API_URL}/api/simulacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantidadeCozinheiros: cooks, algoritmo: algorithm, chapaCompartilhada: sharedGrill }),
  })

  if (!response.ok) {
    const body = (await response.json()) as { erro?: string }
    throw new Error('erro' in body && body.erro ? body.erro : 'A API recusou a simulacao.')
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/x-ndjson')) {
    throw new Error('A API em http://localhost:8080 esta desatualizada. Reinicie o servidor Java compilado.')
  }

  if (!response.body) throw new Error('A API nao enviou o fluxo da simulacao.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  let result: SimulationResult | null = null

  const processLine = (line: string) => {
    if (!line.trim()) return
    const event = JSON.parse(line) as SimulationEvent
    onEvent(event)
    if (event.tipo === 'SIMULACAO_CONCLUIDA' && event.resultado) result = event.resultado
  }

  while (true) {
    const { done, value } = await reader.read()
    pending += decoder.decode(value, { stream: !done })
    const lines = pending.split('\n')
    pending = lines.pop() ?? ''
    lines.forEach(processLine)
    if (done) break
  }
  if (pending.trim()) processLine(pending)
  if (!result) throw new Error('A API encerrou a simulacao sem resultado.')
  return result
}