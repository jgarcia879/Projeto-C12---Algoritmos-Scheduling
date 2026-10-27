package simulation;

import model.Pedido;

public final class EventoSimulacao {
    private final String tipo;
    private final String cozinheiro;
    private final Pedido pedido;
    private final long instante;
        private final long instanteMonotonicoNanos;

        private EventoSimulacao(String tipo, String cozinheiro, Pedido pedido, long instante,
            long instanteMonotonicoNanos) {
        this.tipo = tipo;
        this.cozinheiro = cozinheiro;
        this.pedido = pedido;
        this.instante = instante;
        this.instanteMonotonicoNanos = instanteMonotonicoNanos;
    }

    public static EventoSimulacao criar(String tipo, String cozinheiro, Pedido pedido) {
        return new EventoSimulacao(tipo, cozinheiro, pedido, System.currentTimeMillis(), System.nanoTime());
    }

    public String getTipo() { return tipo; }
    public String getCozinheiro() { return cozinheiro; }
    public Pedido getPedido() { return pedido; }
    public long getInstante() { return instante; }
    public long getInstanteMonotonicoNanos() { return instanteMonotonicoNanos; }
}