import java.util.List;
import model.Pedido;
import model.PedidosPadrao;
import simulation.HistoricoSimulacoes;
import simulation.ResultadoSimulacao;
import simulation.Simulacao;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        List<Pedido> pedidos = criarPedidos();
        HistoricoSimulacoes historico = new HistoricoSimulacoes();

        System.out.println("--- SIMULADOR DE PROCESSAMENTO DE PEDIDOS ---\n");

        for (int quantidadeCozinheiros = Simulacao.MINIMO_COZINHEIROS;
                quantidadeCozinheiros <= Simulacao.MAXIMO_COZINHEIROS;
                quantidadeCozinheiros++) {
            System.out.println("========================================");
            System.out.println("SIMULACAO COM " + quantidadeCozinheiros + " COZINHEIRO"
                    + (quantidadeCozinheiros > 1 ? "S" : ""));
            System.out.println("========================================");

            ResultadoSimulacao resultado = new Simulacao(pedidos, quantidadeCozinheiros).executar();
            historico.adicionar(resultado);
            imprimirResultado(resultado);
            System.out.println();
        }

        imprimirComparacao(historico);
    }

    private static List<Pedido> criarPedidos() {
        return PedidosPadrao.criar();
    }

    private static void imprimirResultado(ResultadoSimulacao resultado) {
        System.out.println("\nResultado:");
        System.out.println("Pedidos: " + resultado.getQuantidadePedidos());
        System.out.println("Pedidos processados: " + resultado.getPedidosProcessados());
        System.out.println("Cozinheiros: " + resultado.getQuantidadeCozinheiros());
        imprimirTempos(resultado);
    }

    private static void imprimirComparacao(HistoricoSimulacoes historico) {
        System.out.println("========================================");
        System.out.println("COMPARACAO DOS CENARIOS");
        System.out.println("========================================");
        System.out.printf("%-14s %-10s %-14s%n", "Cozinheiros", "Pedidos", "Tempo");

        for (ResultadoSimulacao resultado : historico.getResultados()) {
            System.out.printf("%-14d %-10d %.2f s%n",
                    resultado.getQuantidadeCozinheiros(),
                    resultado.getQuantidadePedidos(),
                    resultado.getDuracaoSegundos());
        }

        ResultadoSimulacao melhor = historico.getMelhorResultado();
        System.out.println("\n----------------------------------------");
        System.out.println("ANALISE DE DESEMPENHO");
        System.out.println("----------------------------------------");
        System.out.printf("Tempo minimo teorico: %.2f s%n",
                melhor.getTempoMinimoTeoricoSegundos());
        System.out.printf("Melhor tempo obtido: %.2f s%n", melhor.getDuracaoSegundos());
        System.out.println("Cozinheiros utilizados: " + melhor.getQuantidadeCozinheiros());
        System.out.printf("Diferenca: %.2f s%n", melhor.getDiferencaSegundos());
        System.out.printf("Diferenca percentual: %.2f%%%n", melhor.getDiferencaPercentual());

        if (melhor.isLimiteDesempenhoAtingido()) {
            System.out.println("\nLIMITE DE DESEMPENHO ATINGIDO");
            System.out.printf("O tempo esta ate %.0f%% acima do minimo teorico.%n",
                    melhor.getMargemLimiteDesempenhoPercentual());
            System.out.println("Adicionar mais cozinheiros tende a nao produzir ganho significativo.");
        }
    }

    private static void imprimirTempos(ResultadoSimulacao resultado) {
        System.out.printf("Tempo total real: %.2f segundos%n", resultado.getDuracaoSegundos());
        System.out.printf("Tempo minimo teorico: %.2f segundos%n",
                resultado.getTempoMinimoTeoricoSegundos());
        System.out.printf("Diferenca: %.2f segundos%n", resultado.getDiferencaSegundos());
        System.out.printf("Diferenca percentual: %.2f%%%n", resultado.getDiferencaPercentual());
    }
}