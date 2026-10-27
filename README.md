# Projeto C12 — Algoritmos de Scheduling

Projeto de simulação de concorrência para analisar o processamento de pedidos por cozinheiros com diferentes algoritmos de escalonamento. A aplicação possui um backend em Java que executa a simulação real e um dashboard em React/TypeScript para visualizar os resultados em tempo real.

## Visão geral

- Backend Java: executa a simulação real em threads, calcula tempos e expõe uma API HTTP em `http://localhost:8080`
- Frontend React: mostra filas, métricas, histórico e comparação entre cenários
- Algoritmos suportados: `FCFS`, `SJF` e `PS`
- Recurso extra: chapa compartilhada com semáforo opcional para serializar o preparo em alguns cenários

## Requisitos

- Java JDK 17+
- Node.js 18+
- npm (vem junto com o Node.js)

Verifique se tudo está instalado:

```powershell
java -version
javac -version
node --version
npm --version
```

> No Windows, se `npm` ficar bloqueado no PowerShell, use `npm.cmd` em vez de `npm`.

## Estrutura do projeto

```text
Projeto-C12---Algoritmos-Scheduling/
├── README.md
├── src/
│   ├── Main.java
│   ├── concurrency/
│   ├── model/
│   ├── server/
│   └── simulation/
├── dashboard/
│   ├── package.json
│   ├── src/
│   └── vite.config.ts
├── out/
└── Projeto-C12.iml
```

## Como rodar

### 1) Inicie a API Java

Abra um terminal na raiz do projeto e execute:

```powershell
Set-Location "C:\caminho\para\Projeto-C12---Algoritmos-Scheduling"

$sources = Get-ChildItem -Path src -Recurse -Filter '*.java' | ForEach-Object { $_.FullName }
New-Item -ItemType Directory -Force -Path out | Out-Null
javac -encoding UTF-8 -d out $sources
java -cp out server.SimulacaoApiServer
```

Se tudo funcionar, a API deve iniciar com a mensagem:

```text
API de simulacao real iniciada em http://localhost:8080
```

### 2) Instale e rode o dashboard

Abra um segundo terminal e execute:

```powershell
Set-Location "C:\caminho\para\Projeto-C12---Algoritmos-Scheduling\dashboard"
npm install
npm run dev
```

Após isso, o Vite deve mostrar um endereço como:

```text
http://localhost:5173/
```

Abra esse endereço no navegador para usar a interface.

## Como usar a aplicação

1. Escolha a quantidade de cozinheiros.
2. Selecione o algoritmo de escalonamento.
3. Opcionalmente habilite a chapa compartilhada.
4. Execute a simulação.
5. Observe as métricas, o histórico e o comparativo de desempenho.

Cada execução usa a lista padrão de pedidos definida no backend.

## Teste rápido da API

Com a API Java iniciada, você pode testar o endpoint em outro terminal:

```powershell
$body = @{ quantidadeCozinheiros = 3; algoritmo = "FCFS"; chapaCompartilhada = $false; escalaTempo = 1.0 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/simulacoes" -Method Post -ContentType "application/json" -Body $body
```

## Comandos úteis

Na pasta `dashboard`:

```powershell
npm run dev     # inicia o ambiente de desenvolvimento
npm run build   # valida o build do frontend
npm run preview # visualiza o build final
```

## Problemas comuns

### Porta `8080` ocupada

Feche o processo que está usando a porta 8080 ou altere o valor da constante `PORTA` em `src/server/SimulacaoApiServer.java`.

### Dashboard abre, mas a simulação falha

Confirme se a API Java ainda está aberta e se a mensagem de inicialização apareceu no terminal.

### `npm` não é reconhecido

Use `npm.cmd` no PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

## Observações finais

Este projeto foi pensado para demonstrar escalonamento de processos em um cenário de concorrência real, com métricas e comparação entre cenários em tempo de execução. A simulação é executada de fato no backend em Java, e não por dados fictícios no frontend.