package concurrency;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import model.Pedido;
import simulation.EventoSimulacao;

public class Cozinheiro implements Runnable {
    private final String nome;
    private final java.util.concurrent.Semaphore chapa;
    private final BlockingQueue<Pedido> filaPedidos;
    private final AtomicInteger pedidosProcessados;
    private final Consumer<EventoSimulacao> observador;
    private final double escalaTempo;

    public Cozinheiro(String nome, BlockingQueue<Pedido> filaPedidos,
            AtomicInteger pedidosProcessados, Consumer<EventoSimulacao> observador, java.util.concurrent.Semaphore chapa) {
        this(nome, filaPedidos, pedidosProcessados, observador, chapa, 1.0);
    }

    public Cozinheiro(String nome, BlockingQueue<Pedido> filaPedidos,
            AtomicInteger pedidosProcessados, Consumer<EventoSimulacao> observador,
            java.util.concurrent.Semaphore chapa, double escalaTempo) {
        this.chapa = chapa;
        this.nome = nome;
        this.filaPedidos = filaPedidos;
        this.pedidosProcessados = pedidosProcessados;
        this.observador = observador;
        this.escalaTempo = escalaTempo;
    }

    @Override
    public void run() {
        Pedido pedido;
        while ((pedido = filaPedidos.poll()) != null) {
            boolean adquiriu = false;
            try {
                if (chapa != null) {
                    publicar(EventoSimulacao.criar("AGUARDANDO_CHAPA", nome, pedido));
                    chapa.acquire();
                    adquiriu = true;
                }
                publicar(EventoSimulacao.criar("PEDIDO_INICIADO", nome, pedido));
                PedidoRunnable preparo = new PedidoRunnable(pedido, nome, escalaTempo);
                preparo.run();
                if (preparo.isConcluido()) {
                    pedidosProcessados.incrementAndGet();
                    publicar(EventoSimulacao.criar("PEDIDO_CONCLUIDO", nome, pedido));
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } finally {
                if (adquiriu) chapa.release();
            }
            if (Thread.currentThread().isInterrupted()) {
                break;
            }
        }
    }

    private void publicar(EventoSimulacao evento) {
        if (observador != null) observador.accept(evento);
    }
}