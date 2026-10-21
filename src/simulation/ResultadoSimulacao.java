package simulation;

public class ResultadoSimulacao {
    private final int quantidadeCozinheiros;
    private final int quantidadePedidos;
    private final int pedidosProcessados;
    private final String algoritmo;
    private final long instanteInicial;
    private final long instanteFinal;
    private final double maiorTempoPreparo;
    private final double margemLimiteDesempenho;

    public ResultadoSimulacao(int quantidadeCozinheiros, int quantidadePedidos,
            int pedidosProcessados, String algoritmo, long instanteInicial, long instanteFinal,
            int maiorTempoPreparo, double margemLimiteDesempenho) {
        this(quantidadeCozinheiros, quantidadePedidos, pedidosProcessados, algoritmo,
            instanteInicial, instanteFinal, maiorTempoPreparo, margemLimiteDesempenho, 1.0);
        }

        public ResultadoSimulacao(int quantidadeCozinheiros, int quantidadePedidos,
            int pedidosProcessados, String algoritmo, long instanteInicial, long instanteFinal,
            int maiorTempoPreparo, double margemLimiteDesempenho, double escalaTempo) {
        this.quantidadeCozinheiros = quantidadeCozinheiros;
        this.quantidadePedidos = quantidadePedidos;
        this.pedidosProcessados = pedidosProcessados;
        this.algoritmo = algoritmo;
        this.instanteInicial = instanteInicial;
        this.instanteFinal = instanteFinal;
        this.maiorTempoPreparo = maiorTempoPreparo * escalaTempo;
        this.margemLimiteDesempenho = margemLimiteDesempenho;
    }

    public int getQuantidadeCozinheiros() { return quantidadeCozinheiros; }
    public int getQuantidadePedidos() { return quantidadePedidos; }
    public int getPedidosProcessados() { return pedidosProcessados; }
    public String getAlgoritmo() { return algoritmo; }
    public long getInstanteInicial() { return instanteInicial; }
    public long getInstanteFinal() { return instanteFinal; }
    public long getDuracaoNanos() { return instanteFinal - instanteInicial; }
    public double getDuracaoSegundos() { return getDuracaoNanos() / 1_000_000_000.0; }
    public double getTempoMinimoTeoricoSegundos() { return maiorTempoPreparo; }
    public double getDiferencaSegundos() {
        return getDuracaoSegundos() - getTempoMinimoTeoricoSegundos();
    }
    public double getDiferencaPercentual() {
        if (getTempoMinimoTeoricoSegundos() == 0) return 0.0;
        return (getDiferencaSegundos() / getTempoMinimoTeoricoSegundos()) * 100.0;
    }
    public double getMargemLimiteDesempenhoPercentual() {
        return margemLimiteDesempenho * 100.0;
    }
    public boolean isLimiteDesempenhoAtingido() {
        return getDiferencaSegundos() >= 0
                && getDiferencaSegundos() <= getTempoMinimoTeoricoSegundos()
                        * margemLimiteDesempenho;
    }
}