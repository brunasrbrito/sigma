# Infrastructure

Deploy via Docker Compose com três serviços.

---

## Serviços

| Serviço | Imagem / Build | Porta | Descrição |
|---------|---------------|-------|-----------|
| `mysql` | `mysql:8.4` | `3306` | Banco de dados relacional |
| `api` | `apps/api/Dockerfile` | `3000` | Backend NestJS |
| `web` | `apps/web/Dockerfile` | `3001` | Frontend Next.js |

---

## Variáveis de Ambiente

Crie um `.env` na raiz do projeto baseado nos valores abaixo:

```env
# MySQL
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=sigma
MYSQL_USER=sigma
MYSQL_PASSWORD=sigma

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

Os valores de MySQL já são defaults no `docker-compose.yml`. As variáveis de JWT, Resend e ALLOWED_ORIGIN **são obrigatórias** e não têm defaults.

---

## Comandos

```bash
# Subir tudo
docker compose up -d

# Subir e rebuildar imagens
docker compose up -d --build

# Ver logs
docker compose logs -f

# Derrubar (mantém volume do MySQL)
docker compose down

# Derrubar e apagar dados do MySQL
docker compose down -v
```

---

## Ordem de inicialização

```
mysql (healthcheck) → api → web
```

O `api` aguarda o MySQL responder antes de iniciar. O `web` aguarda o `api` subir.

---

## Dados persistidos

O volume `mysql_data` persiste os dados do MySQL entre restarts. Para resetar o banco, use `docker compose down -v`.
