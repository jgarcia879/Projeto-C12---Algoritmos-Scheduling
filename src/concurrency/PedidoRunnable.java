package concurrency;

import model.Pedido;

public class PedidoRunnable implements Runnable {
    private final Pedido pedido;
    private final String nomeCozinheiro;
    private boolean concluido;

    public PedidoRunnable(Pedido pedido, String nomeCozinheiro) {
        this.pedido = pedido;
        this.nomeCozinheiro = nomeCozinheiro;
    }

    @Override
    public void run() {
        System.out.println("[" + nomeCozinheiro + "] iniciou Pedido #" + pedido.getId()
                + " (" + pedido.getNomePrato() + ")");
        try {
            Thread.sleep(pedido.getTempoPreparo() * 1000L);
            concluido = true;
            System.out.println("[" + nomeCozinheiro + "] concluiu Pedido #" + pedido.getId()
                    + " (" + pedido.getNomePrato() + ")");
        } catch (InterruptedException e) {
            System.out.println("[" + nomeCozinheiro + "] foi interrompido durante o Pedido #"
                    + pedido.getId() + ". Pedido nao concluido.");
            Thread.currentThread().interrupt();
        }
    }

    public boolean isConcluido() { return concluido; }
}