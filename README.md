# Simulador de Concorrencia

Projeto que simula o processamento de pedidos por diferentes quantidades de cozinheiros e exibe os resultados em um dashboard web.

## 1. Pre-requisitos

Instale os seguintes programas:

- Java JDK 17 ou superior
- Node.js 18 ou superior
- npm, que ja vem incluido com o Node.js

Confira se as instalacoes funcionam. No PowerShell do Windows, use `npm.cmd` caso `npm` seja bloqueado pela politica de execucao:

```powershell
java -version
javac -version
node.exe --version
npm.cmd --version
```

## 2. Abra a pasta do projeto

Abra a pasta `repo-projeto-c12` no VS Code ou no explorador de arquivos.

No PowerShell, entre na pasta com:

```powershell
Set-Location "C:\caminho\para\repo-projeto-c12"
```

Substitua o caminho pelo local onde o projeto foi salvo.

## 3. Prepare e inicie a API Java

Abra um terminal na raiz do projeto e execute os comandos abaixo. Eles compilam os arquivos Java na pasta `out` e iniciam a API na porta `8080`:

```powershell
$sources = Get-ChildItem -Path src -Recurse -Filter '*.java' | ForEach-Object FullName
New-Item -ItemType Directory -Force -Path out | Out-Null
javac -d out $sources
java -cp out server.SimulacaoApiServer
```

Deixe esse terminal aberto. A mensagem esperada e semelhante a:

```text
API de simulacao real iniciada em http://localhost:8080
```

## 4. Instale e inicie o dashboard

Abra um segundo terminal. Entre na pasta `dashboard`:

```powershell
Set-Location "C:\caminho\para\repo-projeto-c12\dashboard"
npm.cmd install
npm.cmd run dev
```

O Vite mostrara um endereco parecido com:

```text
http://localhost:5173/
```

Abra esse endereco no navegador. Mantenha os dois terminais abertos enquanto estiver usando o sistema.

## 5. Como usar

1. Abra o dashboard no navegador.
2. Escolha a quantidade de cozinheiros.
3. Execute a simulacao.
4. Observe o tempo de processamento, a comparacao com o tempo teorico e o historico das simulacoes.

Cada simulacao usa a lista padrao de 20 pedidos definida no backend.

## 6. Teste rapido da API (opcional)

Com a API Java em execucao, abra outro terminal e rode:

```powershell
$body = @{ quantidadeCozinheiros = 3 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/simulacoes" -Method Post -ContentType "application/json" -Body $body
```

Se estiver funcionando, o terminal retornara um resultado JSON com a quantidade de cozinheiros, pedidos processados e tempos da simulacao.

## 7. Parar o projeto

Em cada terminal que estiver executando um processo, pressione `Ctrl+C`.

## Problemas comuns

### `npm` nao e reconhecido ou foi bloqueado

Use `npm.cmd` nos comandos:

```powershell
npm.cmd install
npm.cmd run dev
```

### A porta 8080 ja esta em uso

Encerre o programa que esta usando a porta e tente iniciar a API novamente. O dashboard esta configurado para procurar a API em `http://localhost:8080`.

### O dashboard abre, mas a simulacao falha

Confirme se o terminal da API ainda esta aberto e se mostrou a mensagem de inicializacao. A API Java precisa estar rodando antes de executar uma simulacao no navegador.

## Comandos uteis do dashboard

Dentro da pasta `dashboard`:

```powershell
npm.cmd run dev      # inicia o ambiente de desenvolvimento
npm.cmd run build    # verifica tipos e gera o build de producao
npm.cmd run preview  # visualiza o build gerado
```