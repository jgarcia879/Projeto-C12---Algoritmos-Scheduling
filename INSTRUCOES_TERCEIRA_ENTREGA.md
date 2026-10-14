# Terceira entrega — escalonamento de CPU

Esta pasta é uma cópia local do projeto original. Nenhuma alteração no GitHub é necessária.

## O que foi adicionado
- **FCFS:** fila FIFO na ordem de chegada (ID).
- **SJF:** ordenação pelo menor tempo de preparo; não preemptivo.
- **PS:** ordenação pela prioridade (1 alta, 2 média, 3 baixa; calculada a partir do ID para a demonstração).
- **Chapa compartilhada opcional:** um `Semaphore(1, true)` garante que somente um cozinheiro use a chapa por vez. A opção desligada mantém a concorrência original.
- Dashboard com seletor de algoritmo, checkbox de chapa e fila ordenada.

A fila é compartilhada entre threads e o acesso a cada pedido é atômico (`BlockingQueue.poll()`). Na chapa, cozinheiros aguardam a liberação do semáforo. Os algoritmos não são preemptivos. O ordenamento ocorre antes de iniciar as threads; com múltiplos cozinheiros, a ordem exata de **início** pode variar devido ao escalonador real do Java. A fila exibida é ordenada pelo algoritmo e mostra os estados de cada pedido.

## Executar no VS Code (Windows)

Pré-requisitos: Java JDK 17+ e Node.js 20+ instalados.

**Terminal 1 — API Java**, a partir da pasta raiz do projeto:

```powershell
New-Item -ItemType Directory -Force out | Out-Null
javac -encoding UTF-8 -d out src/model/*.java src/concurrency/*.java src/simulation/*.java src/server/*.java src/Main.java
java -cp out server.SimulacaoApiServer
```

**Terminal 2 — Dashboard:**

```powershell
cd dashboard
npm install
npm run dev
```

Abra a URL mostrada pelo Vite (geralmente http://localhost:5173). A API deve permanecer aberta em http://localhost:8080.

**Para demonstrar:** selecione FCFS, SJF e PS em simulações diferentes. Depois ative a chapa compartilhada com 3 cozinheiros e observe que somente um pedido é preparado por vez. Compare com a opção desativada.

**Observação:** os indicadores de mínimo teórico e desempenho são herdados da entrega anterior e não representam um limite de escalonamento quando a chapa está ativada. Os tempos são reais (Thread.sleep), não tempo virtual.
