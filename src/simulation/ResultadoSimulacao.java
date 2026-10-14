package simulation;

public class ResultadoSimulacao {
    private final int quantidadeCozinheiros;
    private final int quantidadePedidos;
    private final int pedidosProcessados;
    private final long instanteInicial;
    private final long instanteFinal;
    private final int maiorTempoPreparo;
    private final double margemLimiteDesempenho;

    public ResultadoSimulacao(int quantidadeCozinheiros, int quantidadePedidos,
            int pedidosProcessados, long instanteInicial, long instanteFinal,
            int maiorTempoPreparo, double margemLimiteDesempenho) {
        this.quantidadeCozinheiros = quantidadeCozinheiros;
        this.quantidadePedidos = quantidadePedidos;
        this.pedidosProcessados = pedidosProcessados;
        this.instanteInicial = instanteInicial;
        this.instanteFinal = instanteFinal;
        this.maiorTempoPreparo = maiorTempoPreparo;
        this.margemLimiteDesempenho = margemLimiteDesempenho;
    }

    public int getQuantidadeCozinheiros() { return quantidadeCozinheiros; }
    public int getQuantidadePedidos() { return quantidadePedidos; }
    public int getPedidosProcessados() { return pedidosProcessados; }
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