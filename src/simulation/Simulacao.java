package simulation;

import concurrency.Cozinheiro;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import model.Pedido;

public class Simulacao {
    public static final int MINIMO_COZINHEIROS = 1;
    public static final int MAXIMO_COZINHEIROS = 20;
    public static final double MARGEM_LIMITE_DESEMPENHO = 0.05;
    private static final List<String> ALGORITMOS_VALIDOS = List.of("FCFS", "SJF", "PS");

    private final List<Pedido> pedidos;
    private final int quantidadeCozinheiros;
    private final String algoritmo;
    private final boolean chapaCompartilhada;
    private final double escalaTempo;

    public Simulacao(List<Pedido> pedidos, int quantidadeCozinheiros) {
        this(pedidos, quantidadeCozinheiros, "FCFS", false, 1.0);
    }

    public Simulacao(List<Pedido> pedidos, int quantidadeCozinheiros, String algoritmo,
            boolean chapaCompartilhada) {
        this(pedidos, quantidadeCozinheiros, algoritmo, chapaCompartilhada, 1.0);
    }

    public Simulacao(List<Pedido> pedidos, int quantidadeCozinheiros, String algoritmo,
            boolean chapaCompartilhada, double escalaTempo) {
        String algoritmoNormalizado = algoritmo == null ? "" : algoritmo.trim().toUpperCase(Locale.ROOT);

        if (quantidadeCozinheiros < MINIMO_COZINHEIROS || quantidadeCozinheiros > MAXIMO_COZINHEIROS) {
            throw new IllegalArgumentException("Quantidade de cozinheiros invalida.");
        }
        if (!ALGORITMOS_VALIDOS.contains(algoritmoNormalizado)) {
            throw new IllegalArgumentException("Algoritmo invalido.");
        }
        if (!Double.isFinite(escalaTempo) || escalaTempo <= 0 || escalaTempo > 1) {
            throw new IllegalArgumentException("Escala de tempo invalida.");
        }

        this.algoritmo = algoritmoNormalizado;
        this.chapaCompartilhada = chapaCompartilhada;
        this.escalaTempo = escalaTempo;
        this.pedidos = new ArrayList<>(pedidos);

        if ("SJF".equals(this.algoritmo)) {
            this.pedidos.sort(java.util.Comparator.comparingInt(Pedido::getTempoPreparo)
                    .thenComparingInt(Pedido::getId));
        }
        if ("PS".equals(this.algoritmo)) {
            this.pedidos.sort(java.util.Comparator.comparingInt(Pedido::getPrioridade)
                    .thenComparingInt(Pedido::getId));
        }
        this.quantidadeCozinheiros = quantidadeCozinheiros;
    }

    public ResultadoSimulacao executar() throws InterruptedException {
        return executar(null);
    }

    public ResultadoSimulacao executar(Consumer<EventoSimulacao> observador) throws InterruptedException {
        BlockingQueue<Pedido> filaPedidos = new ArrayBlockingQueue<>(pedidos.size());
        filaPedidos.addAll(pedidos);

        AtomicInteger pedidosProcessados = new AtomicInteger();
        AtomicLong esperaTotalNanos = new AtomicLong();
        ConcurrentHashMap<Integer, Long> entradaNaFilaNanos = new ConcurrentHashMap<>();
        java.util.concurrent.Semaphore chapa = chapaCompartilhada ? new java.util.concurrent.Semaphore(1, true) : null;
        List<Thread> threads = new ArrayList<>();

        publicar(observador, EventoSimulacao.criar("SIMULACAO_INICIADA", "", null));
        for (Pedido pedido : pedidos) {
            entradaNaFilaNanos.put(pedido.getId(), System.nanoTime());
            publicar(observador, EventoSimulacao.criar("PEDIDO_AGUARDANDO", "", pedido));
        }

        Consumer<EventoSimulacao> observadorComEspera = evento -> {
            if ("PEDIDO_INICIADO".equals(evento.getTipo()) && evento.getPedido() != null) {
                Long entrada = entradaNaFilaNanos.get(evento.getPedido().getId());
                if (entrada != null) {
                    esperaTotalNanos.addAndGet(Math.max(0L, evento.getInstanteMonotonicoNanos() - entrada));
                }
            }
            publicar(observador, evento);
        };

        for (int i = 1; i <= quantidadeCozinheiros; i++) {
            Thread thread = new Thread(
                    new Cozinheiro("COZINHEIRO " + i, filaPedidos, pedidosProcessados,
                            observadorComEspera, chapa, escalaTempo),
                    "cozinheiro-" + i);
            threads.add(thread);
        }

        long instanteInicial = System.nanoTime();
        for (Thread thread : threads) {
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        long instanteFinal = System.nanoTime();

        int maiorTempoPreparo = pedidos.stream()
                .mapToInt(Pedido::getTempoPreparo)
                .max()
                .orElse(0);

        return new ResultadoSimulacao(
                quantidadeCozinheiros,
                pedidos.size(),
                pedidosProcessados.get(),
                algoritmo,
                instanteInicial,
                instanteFinal,
                maiorTempoPreparo,
                MARGEM_LIMITE_DESEMPENHO,
                escalaTempo,
                esperaTotalNanos.get());
    }

    private void publicar(Consumer<EventoSimulacao> observador, EventoSimulacao evento) {
        if (observador != null) {
            observador.accept(evento);
        }
    }
}