package model;

import java.util.Arrays;
import java.util.List;

public final class PedidosPadrao {
    private PedidosPadrao() { }

    public static List<Pedido> criar() {
        return Arrays.asList(
                new Pedido(1, "Hamburguer", 3), new Pedido(2, "Batata Frita", 1),
                new Pedido(3, "Pizza", 5), new Pedido(4, "Lasanha", 7),
                new Pedido(5, "Hot Dog", 2), new Pedido(6, "Salada", 2),
                new Pedido(7, "Sopa", 4), new Pedido(8, "Macarrao", 6),
                new Pedido(9, "Tacos", 3), new Pedido(10, "Risoto", 5),
                new Pedido(11, "Nuggets", 2), new Pedido(12, "Bife Acebolado", 8),
                new Pedido(13, "Panqueca", 4), new Pedido(14, "Sanduiche", 1),
                new Pedido(15, "Peixe Grelhado", 6), new Pedido(16, "Coxinha", 2),
                new Pedido(17, "Escondidinho", 5), new Pedido(18, "Wrap", 3),
                new Pedido(19, "Calzone", 7), new Pedido(20, "Brownie", 4));
    }
}