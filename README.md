# Sistema de gestión de suscripciones B2B

Módulo para que un administrador de una cuenta corporativa asigne licencias a sus empleados, consulte el consumo de la API y reciba un aviso al acercarse al límite contratado.

## Arquitectura

El repositorio está dividido en `backend/` y `frontend/`.

- **Backend:** NestJS con TypeScript. Prefijo `/api`, versionado URI (`/api/v1`), validación global de entrada y un filtro de excepciones único. PostgreSQL con TypeORM. Los módulos `auth`, `users`, `companies`, `licenses` y `usage` exponen login JWT, consumo, directorio y asignación de licencias.
- **Frontend:** Next.js (App Router), TypeScript y Tailwind CSS. La sesión JWT vive en Zustand. El estado de servidor (consumo y directorio) se pide a la API y no se duplica en el store. El gráfico de Recharts y el diálogo de asignación se cargan con `next/dynamic`. Las filas de la tabla están memoizadas.
- **Base de datos:** PostgreSQL, prevista para correr en Docker. Todavía no hay `docker-compose.yml`; el backend lee la conexión desde variables de entorno.

## Ejecución

Hoy cada aplicación se levanta por separado. Un solo comando con Docker queda para cuando la API y la base estén cableadas.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Consola en [http://localhost:3001](http://localhost:3001). Habla con la API de `http://localhost:3000/api/v1`. `NEXT_PUBLIC_API_MODE=mock` deja la consola en datos locales. El detalle está en [frontend/README.md](frontend/README.md).

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API en [http://localhost:3000/api/v1](http://localhost:3000/api/v1). Salud: `GET /api/v1/health`.

## Supuestos

- Hay dos roles, `Admin` y `User`. Solo `Admin` asigna licencias. `User` consulta el consumo y el directorio.
- El consumo “en tiempo real” se resuelve consultando `GET /api/v1/usage` cada 15 segundos mientras la pestaña está visible. No hay WebSocket en esta versión.
- La alerta aparece al 80% del límite y cambia de tono al superarlo. El umbral viaja en la respuesta de uso (`alertThreshold`).
- `POST /api/v1/licenses/assign` recibe `{ userId }` y el backend rechaza la operación si el empleado ya tiene licencia o si la empresa llegó al cupo.
- El frontend usa la API real. `NEXT_PUBLIC_API_MODE=mock` conserva el modo local.
- El token se guarda en `sessionStorage`. La protección de rutas es en el cliente. Cuando el backend emita cookies `httpOnly`, esta pieza se sustituye.
