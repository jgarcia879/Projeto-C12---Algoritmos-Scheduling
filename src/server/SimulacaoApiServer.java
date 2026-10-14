package server;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import model.Pedido;
import model.PedidosPadrao;
import simulation.ResultadoSimulacao;
import simulation.EventoSimulacao;
import simulation.Simulacao;

public class SimulacaoApiServer {
    private static final int PORTA = 8080;
    private static final Pattern COZINHEIROS_PATTERN =
            Pattern.compile("\"quantidadeCozinheiros\"\\s*:\\s*(\\d+)");

    private static final Pattern ALGORITMO_PATTERN = Pattern.compile("\"algoritmo\"\\s*:\\s*\"(FCFS|SJF|PS)\"");
    private static final Pattern CHAPA_PATTERN = Pattern.compile("\"chapaCompartilhada\"\\s*:\\s*(true|false)");

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORTA), 0);
        server.createContext("/api/simulacoes", SimulacaoApiServer::atenderSimulacao);
        server.start();
        System.out.println("API de simulacao real iniciada em http://localhost:" + PORTA);
    }

    private static void atenderSimulacao(HttpExchange exchange) throws IOException {
        adicionarCors(exchange.getResponseHeaders());

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            responder(exchange, 204, "");
            return;
        }
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            responderJson(exchange, 405, "{\"erro\":\"Use POST neste endpoint.\"}");
            return;
        }

        try {
            String corpo = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Matcher matcher = COZINHEIROS_PATTERN.matcher(corpo);
            if (!matcher.find()) {
                responderJson(exchange, 400, "{\"erro\":\"Informe quantidadeCozinheiros.\"}");
                return;
            }

            int quantidadeCozinheiros = Integer.parseInt(matcher.group(1));
            Matcher alg = ALGORITMO_PATTERN.matcher(corpo);
            Matcher chapa = CHAPA_PATTERN.matcher(corpo);
            String algoritmo = alg.find() ? alg.group(1) : "FCFS";
            boolean compartilhar = chapa.find() && Boolean.parseBoolean(chapa.group(1));
            List<Pedido> pedidos = PedidosPadrao.criar();
                exchange.getResponseHeaders().set("Content-Type", "application/x-ndjson; charset=UTF-8");
                exchange.sendResponseHeaders(200, 0);
                try (OutputStream output = exchange.getResponseBody()) {
                Object monitor = new Object();
                ResultadoSimulacao resultado = new Simulacao(pedidos, quantidadeCozinheiros, algoritmo, compartilhar)
                    .executar(evento -> escreverEvento(output, monitor, evento));
                escreverLinha(output, monitor,
                    "{\"tipo\":\"SIMULACAO_CONCLUIDA\",\"resultado\":"
                        + paraJson(resultado) + "}");
                }
        } catch (IllegalArgumentException e) {
            responderJson(exchange, 400, "{\"erro\":\"" + escapar(e.getMessage()) + "\"}");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            responderJson(exchange, 500, "{\"erro\":\"A simulacao foi interrompida.\"}");
        } catch (Exception e) {
            responderJson(exchange, 500, "{\"erro\":\"Falha ao executar a simulacao.\"}");
        }
    }

    private static String paraJson(ResultadoSimulacao resultado) {
        return String.format(Locale.US,
                "{\"quantidadeCozinheiros\":%d,\"quantidadePedidos\":%d,"
                        + "\"pedidosProcessados\":%d,\"duracaoSegundos\":%.4f,"
                        + "\"tempoMinimoTeorico\":%.4f,\"diferencaSegundos\":%.4f,"
                        + "\"diferencaPercentual\":%.4f}",
                resultado.getQuantidadeCozinheiros(), resultado.getQuantidadePedidos(),
                resultado.getPedidosProcessados(), resultado.getDuracaoSegundos(),
                resultado.getTempoMinimoTeoricoSegundos(), resultado.getDiferencaSegundos(),
                resultado.getDiferencaPercentual());
    }

    private static void escreverEvento(OutputStream output, Object monitor,
            EventoSimulacao evento) {
        StringBuilder json = new StringBuilder("{\"tipo\":\"")
                .append(evento.getTipo()).append("\",\"cozinheiro\":\"")
                .append(escapar(evento.getCozinheiro())).append("\",\"instante\":")
                .append(evento.getInstante());
        Pedido pedido = evento.getPedido();
        if (pedido != null) {
            json.append(",\"pedidoId\":").append(pedido.getId())
                    .append(",\"nomePrato\":\"").append(escapar(pedido.getNomePrato()))
                    .append("\",\"tempoPreparo\":").append(pedido.getTempoPreparo());
        }
        json.append('}');
        escreverLinha(output, monitor, json.toString());
    }

    private static void escreverLinha(OutputStream output, Object monitor, String linha) {
        synchronized (monitor) {
            try {
                output.write((linha + "\n").getBytes(StandardCharsets.UTF_8));
                output.flush();
            } catch (IOException e) {
                throw new IllegalStateException("Falha ao transmitir evento da simulacao.", e);
            }
        }
    }

    private static void adicionarCors(Headers headers) {
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void responderJson(HttpExchange exchange, int status, String corpo) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        responder(exchange, status, corpo);
    }

    private static void responder(HttpExchange exchange, int status, String corpo) throws IOException {
        byte[] bytes = corpo.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private static String escapar(String texto) {
        return texto == null ? "Erro desconhecido" : texto.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
