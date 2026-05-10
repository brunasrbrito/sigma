# Prompt — Bloco 0: Next.js Proxy

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto do projeto

Stack: Next.js 16 (App Router) + NestJS (backend na porta 3000).

O frontend roda em `http://localhost:3001`.
O backend roda em `http://localhost:3000` (NestJS, Swagger em `/api/docs`).

**Problema atual:** o `api.ts` envia requisições diretamente ao backend usando `NEXT_PUBLIC_APP_URL`.
Isso expõe a URL do backend ao browser e quebra cookies `HttpOnly` por CORS.

**O que deve existir após esta implementação:**

```
Browser → http://localhost:3001/api/* → Next.js rewrite → http://localhost:3000/api/*
```

O browser nunca conhece a porta 3000. Todas as chamadas são relativas ao Next.js.

---

## Arquivos a ler antes de alterar

Leia os três arquivos abaixo antes de qualquer edição:

1. `apps/web/next.config.ts`
2. `apps/web/src/services/api.ts`
3. `apps/web/.env.local` (pode não existir — tudo bem)

---

## Implementação

### 1. `apps/web/.env.local` — criar se não existir

```env
BACKEND_URL=http://localhost:3000
```

> Esta variável é server-side only. NÃO use prefixo `NEXT_PUBLIC_`.

---

### 2. `apps/web/next.config.ts` — adicionar rewrites

Substitua o conteúdo pelo seguinte:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

> O `rewrites` é executado no servidor Next.js. O browser envia para `/api/...`,
> o Next.js encaminha para `BACKEND_URL/api/...` preservando headers, body e cookies.

---

### 3. `apps/web/src/services/api.ts` — remover baseURL fixa

Substitua o conteúdo pelo seguinte:

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLogin = originalRequest?.url?.includes("/auth/login");

    if (isLogin) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

> Mudanças em relação ao original:
> - `baseURL` era `process.env.NEXT_PUBLIC_APP_URL` → agora é `"/"`
> - `axios.post(...)` no refresh era `${process.env.NEXT_PUBLIC_APP_URL}/auth/refresh` → agora é `"/api/auth/refresh"`

---

## Validação — execute após implementar

Rode os comandos abaixo **em sequência** e use os resultados para montar o JSON de saída.

### Checagem estática (sem servidor)

**V1 — `.env.local` existe e tem `BACKEND_URL`:**
```bash
cat apps/web/.env.local
```
Esperado: linha contendo `BACKEND_URL=http://localhost:3000`

**V2 — `next.config.ts` tem rewrites:**
```bash
grep -n "rewrites\|BACKEND_URL\|:path\*" apps/web/next.config.ts
```
Esperado: encontrar as 3 strings.

**V3 — `api.ts` não contém `NEXT_PUBLIC`:**
```bash
grep -n "NEXT_PUBLIC" apps/web/src/services/api.ts
```
Esperado: nenhuma linha retornada (exit code 1 do grep é OK aqui).

**V4 — `api.ts` tem `baseURL: "/"`:**
```bash
grep -n 'baseURL' apps/web/src/services/api.ts
```
Esperado: linha contendo `baseURL: "/"`.

**V5 — interceptor usa URL relativa:**
```bash
grep -n "auth/refresh" apps/web/src/services/api.ts
```
Esperado: linha contendo `"/api/auth/refresh"` (sem host).

### Checagem dinâmica (servidor rodando)

> Só execute se o servidor Next.js (`apps/web`) estiver rodando em localhost:3001.
> Se não estiver rodando, marque `"server_running": false` e pule V6/V7.

**V6 — proxy encaminha para o backend (docs-json):**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs-json
```
Esperado: `200`

**V7 — login via proxy retorna 200 e define cookie:**
```bash
curl -s -c /tmp/sigma_cookies.txt -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sigma.com","password":"Senha123!"}'
```
Esperado: `200`

```bash
grep "access_token\|refresh_token" /tmp/sigma_cookies.txt
```
Esperado: 2 linhas com os tokens.

---

## Resultado esperado — JSON de saída

Após executar todas as validações, retorne **exatamente** este JSON preenchido:

```json
{
  "bloco": 0,
  "nome": "Next.js Proxy",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/.env.local", "acao": "<criado | ja_existia | erro>" },
    { "arquivo": "apps/web/next.config.ts", "acao": "<editado | erro>" },
    { "arquivo": "apps/web/src/services/api.ts", "acao": "<editado | erro>" }
  ],
  "validacoes": {
    "V1_env_local_existe": "<ok | falhou>",
    "V2_rewrites_configurado": "<ok | falhou>",
    "V3_sem_NEXT_PUBLIC": "<ok | falhou>",
    "V4_baseURL_relativa": "<ok | falhou>",
    "V5_refresh_relativo": "<ok | falhou>",
    "server_running": "<true | false>",
    "V6_proxy_docs_json": "<ok | falhou | skip>",
    "V7_login_via_proxy": "<ok | falhou | skip>",
    "V7_cookies_definidos": "<ok | falhou | skip>"
  },
  "erros": [],
  "observacoes": ""
}
```

Regras de preenchimento:
- `status: "ok"` → todas as validações aplicáveis passaram
- `status: "parcial"` → validações estáticas OK, dinâmicas não executadas (servidor offline)
- `status: "falhou"` → ao menos uma validação estática falhou
- `erros` → lista de strings descrevendo o que deu errado (vazio `[]` se tudo OK)
- `observacoes` → qualquer detalhe relevante que o agente queira registrar
