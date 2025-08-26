# Check-in App (Expo React Native + TypeScript)

Aplicativo mobile para operadores de portaria realizarem check-in de participantes em eventos, com QR Scanner e suporte offline.

---

## 1️⃣ Configuração do `.env`

Crie um arquivo `.env` na raiz do projeto:

```
BASE_URL=https://api.exemplo.com
TOKEN=seu_token_aqui
```

> O `TOKEN` será usado em todas as requisições à API.

No `api.ts`:

```ts
import { BASE_URL } from "@env"; // ou process.env.BASE_URL
```

---

## 2️⃣ Instalar dependências

```bash
npm install
expo install react-native-gesture-handler react-native-reanimated react-native-root-toast
expo install expo-camera expo-barcode-scanner expo-haptics
expo install @react-native-async-storage/async-storage
npm install axios lodash.debounce @react-navigation/native @react-navigation/native-stack
```

---

## 3️⃣ Rodar o app

```bash
npx expo start
```

* Abra no **simulador** ou no **celular real** usando o app Expo Go
* Teste os fluxos: **Evento → Participantes → Check-in / Scanner / Offline**
