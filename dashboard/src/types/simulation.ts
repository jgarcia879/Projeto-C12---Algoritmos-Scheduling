export interface Order {
  id: number
  dish: string
  prepSeconds: number
  priority?: number
  status?: OrderStatus
}

export type OrderStatus = 'AGUARDANDO' | 'PREPARANDO' | 'CONCLUIDO'

export type CookStatus = 'LIVRE' | 'PREPARANDO' | 'FINALIZADO'

export interface CookState {
  id: number
  name: string
  status: CookStatus
  currentOrderId?: number
  startedAt?: number
}

export interface SimulationEvent {
  tipo: 'SIMULACAO_INICIADA' | 'PEDIDO_AGUARDANDO' | 'PEDIDO_INICIADO' | 'PEDIDO_CONCLUIDO' | 'SIMULACAO_CONCLUIDA' | 'AGUARDANDO_CHAPA'
  cozinheiro: string
  instante: number
  pedidoId?: number
  nomePrato?: string
  tempoPreparo?: number
  prioridade?: number
  resultado?: SimulationResult
}

export interface SimulationResult {
  quantidadeCozinheiros: number
  quantidadePedidos: number
  pedidosProcessados: number
  duracaoSegundos: number
  tempoMinimoTeorico: number
  diferencaSegundos: number
  diferencaPercentual: number
}