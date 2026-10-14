package simulation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class HistoricoSimulacoes {
    private final List<ResultadoSimulacao> resultados = new ArrayList<>();

    public void adicionar(ResultadoSimulacao resultado) {
        resultados.add(resultado);
    }

    public List<ResultadoSimulacao> getResultados() {
        return Collections.unmodifiableList(resultados);
    }

    public ResultadoSimulacao getMelhorResultado() {
        return resultados.stream()
                .min((primeiro, segundo) -> Double.compare(
                        primeiro.getDuracaoSegundos(), segundo.getDuracaoSegundos()))
                .orElse(null);
    }
}