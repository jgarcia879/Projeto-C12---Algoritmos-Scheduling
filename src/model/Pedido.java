package model;

public class Pedido {
    private final int id;
    private final String nomePrato;
    private final int tempoPreparo;

    public Pedido(int id, String nomePrato, int tempoPreparo) {
        if (tempoPreparo < 0) {
            throw new IllegalArgumentException("O tempo de preparo nao pode ser negativo.");
        }
        this.id = id;
        this.nomePrato = nomePrato;
        this.tempoPreparo = tempoPreparo;
    }

    // Prioridade demonstrativa: 1 (alta), 2 (media), 3 (baixa).
    public int getPrioridade() { return (id - 1) % 3 + 1; }
    public int getId() { return id; }
    public String getNomePrato() { return nomePrato; }
    public int getTempoPreparo() { return tempoPreparo; }
}