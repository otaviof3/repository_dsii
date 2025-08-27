# App de Check-in de Eventos

Aplicativo mobile Expo com React Native e TypeScript para gerenciar eventos e check-ins de participantes.

---

## 1. Configuração do .env

Crie um arquivo .env na raiz do projeto e adicione as variáveis:

env
PORT=5044
TOKEN=seu_token_aqui
PORT: porta da API (Padrão 5044)

TOKEN: token de autenticação da API

---

## 2. Instalando dependências

No terminal, execute:

bash
Copiar código
npm install

---

## 3. Rodando o projeto

Inicie o Expo:

bash
Copiar código
npx expo start
Depois abra o app no seu dispositivo ou emulador usando o QR code exibido.

---

## 4. Estrutura do Projeto

App.tsx: configuração do NavigationContainer e das rotas.

src/screens/EventScreen.tsx: lista de eventos, mostra stats (presentes/ausentes).

src/screens/AttendeesScreen.tsx: lista de participantes com filtro e busca.

src/screens/CheckinScreen.tsx: tela de check-in (somente marcar como presente).

src/services/api.ts: cliente Axios para comunicar com a API.

server.js (ou index.js): API em Node.js/Express com endpoints para eventos e participantes.

---

## 5. Notas

O check-in só pode ser feito uma vez; não há opção de desfazer.

Stats de presentes/ausentes são atualizados automaticamente ao fazer check-in.

Se estiver usando a API em memória, reiniciar o servidor reseta os check-ins.
