# Infrastructure

Deploy via Docker Compose com três serviços.

---

## Serviços

| Serviço | Imagem / Build | Porta | Descrição |
|---------|---------------|-------|-----------|
| `api` | `apps/api/Dockerfile` | `3000` | Backend NestJS |
| `web` | `apps/web/Dockerfile` | `3001` | Frontend Next.js |

---

## Variáveis de Ambiente

Crie um `.env` na raiz do projeto baseado nos valores abaixo:

```env
# SQLite
DATABASE_PATH=./sigma.db

# JWT (obrigatório — sem defaults)
JWT_SECRET=troque-em-producao
JWT_REFRESH_SECRET=troque-em-producao-refresh

# E-mail (reset de senha via Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# CORS — origem permitida pelo NestJS
ALLOWED_ORIGIN=http://localhost:3001

# API (usada pelo web)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

As variáveis de JWT, Resend e ALLOWED_ORIGIN **são obrigatórias** e não têm defaults.

---

## Comandos

```bash
# Subir tudo
docker compose up -d

# Subir e rebuildar imagens
docker compose up -d --build

# Ver logs
docker compose logs -f

# Derrubar (mantém arquivo SQLite)
docker compose down

# Derrubar e apagar dados do SQLite
docker compose down -v
```

---

## Ordem de inicialização

```text
api → web
```

O `web` aguarda o `api` subir.

---

## Dados persistidos

O arquivo SQLite é persistido via volume Docker entre restarts. Para resetar o banco, use `docker compose down -v`.

---

## Homelab (produção)

A API é publicada automaticamente no GitHub Container Registry via GitHub Actions a cada push em `master` que altere `apps/api/`.

**Imagem:** `ghcr.io/marlondantas/sigma-api:latest`

### Deploy no homelab

```bash
# Primeira vez — autenticar no ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u marlondantas --password-stdin

# Subir API + Web
docker compose -f docker-compose.homelab.yml up -d

# Atualizar para a última imagem
docker compose -f docker-compose.homelab.yml pull api
docker compose -f docker-compose.homelab.yml up -d api
```

### Variáveis obrigatórias no .env do homelab

```env
DATABASE_PATH=./sigma.db

JWT_SECRET=
JWT_REFRESH_SECRET=
RESEND_API_KEY=
ALLOWED_ORIGIN=https://seu-dominio-web.com
```

### Cloudflare Tunnel

Exponha a porta `3001` via Cloudflare Tunnel. No Next.js (web), configure:

```env
API_URL=https://api.seu-tunnel.trycloudflare.com   # lido só server-side
NEXT_PUBLIC_API_URL=/api                             # browser aponta pro proxy local
```

O Next.js já possui route handlers em `/app/api/` que fazem proxy para `API_URL`, eliminando CORS.
