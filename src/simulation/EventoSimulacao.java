package simulation;

import model.Pedido;

public final class EventoSimulacao {
    private final String tipo;
    private final String cozinheiro;
    private final Pedido pedido;
    private final long instante;

    private EventoSimulacao(String tipo, String cozinheiro, Pedido pedido, long instante) {
        this.tipo = tipo;
        this.cozinheiro = cozinheiro;
        this.pedido = pedido;
        this.instante = instante;
    }

    public static EventoSimulacao criar(String tipo, String cozinheiro, Pedido pedido) {
        return new EventoSimulacao(tipo, cozinheiro, pedido, System.currentTimeMillis());
    }

    public String getTipo() { return tipo; }
    public String getCozinheiro() { return cozinheiro; }
    public Pedido getPedido() { return pedido; }
    public long getInstante() { return instante; }
}