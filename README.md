# Sistema de gestión de suscripciones B2B

Módulo para que un administrador de una cuenta corporativa asigne licencias a sus empleados, consulte el consumo de la API y reciba un aviso al acercarse al límite contratado.

## Arquitectura

El repositorio está dividido en `backend/` y `frontend/`.

- **Backend:** NestJS con TypeScript. Prefijo `/api`, versionado URI (`/api/v1`), validación global de entrada y un filtro de excepciones único. PostgreSQL con TypeORM. Los módulos `auth`, `users`, `companies`, `licenses` y `usage` exponen login JWT, consumo, directorio y asignación de licencias.
- **Frontend:** Next.js (App Router), TypeScript y Tailwind CSS. La sesión JWT vive en Zustand. El estado de servidor (consumo y directorio) se pide a la API y no se duplica en el store. El gráfico de Recharts y el diálogo de asignación se cargan con `next/dynamic`. Las filas de la tabla están memoizadas.
- **Base de datos:** PostgreSQL 16. En Docker el backend se conecta al servicio `db`; en local, a `localhost`.

## Ejecución

```bash
docker compose up --build
```

- Frontend: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- PostgreSQL: `localhost:5432`, usuario `saas`, clave `saas`, base `saas_subscriptions`

El navegador llama a la API en `localhost:3000`. Dentro de Compose el backend usa `DB_HOST=db`. `NODE_ENV=development` crea el esquema y carga los datos de demostración la primera vez.

Cuentas:

- Admin: `admin@andeslogistica.com` / `Admin123!`
- User: `analista@andeslogistica.com` / `User123!`

Para detenerlo: `docker compose down`. Los datos de Postgres quedan en el volumen `pgdata`.

### Sin Docker

#### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend en [http://localhost:3001](http://localhost:3001). Habla con la API de `http://localhost:3000/api/v1`. `NEXT_PUBLIC_API_MODE=mock` deja la consola en datos locales. El detalle está en [frontend/README.md](frontend/README.md).

#### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API en [http://localhost:3000/api/v1](http://localhost:3000/api/v1). Salud: `GET /api/v1/health`.
