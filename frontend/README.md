# Frontend

Consola Next.js para administradores de cuentas corporativas. Muestra el consumo de la API y permite asignar licencias dentro del cupo contratado.

## Stack

- Next.js 16 (App Router) y React 19, en TypeScript
- Tailwind CSS 4
- Zustand para la sesión (token JWT y usuario en `sessionStorage`)
- Recharts para la serie de consumo, cargado con `next/dynamic`

El servidor de desarrollo escucha en el puerto **3001**, el origen que el backend ya admite en CORS.

## Ejecución

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001).

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Desarrollo en el puerto 3001 |
| `npm run lint` | ESLint |
| `npm run test` | Pruebas unitarias con Vitest |
| `npm run build` | Build de producción |

### Modos de API

Por defecto la consola llama a `NEXT_PUBLIC_API_URL` (`http://localhost:3000/api/v1`) con `Authorization: Bearer`. El backend tiene que estar en marcha y con la base sembrada.

`NEXT_PUBLIC_API_MODE=mock` vuelve a los datos locales, sin API.

Cuentas del modo demostración:

- Admin: `admin@andeslogistica.com` / `Admin123!`
- User: `analista@andeslogistica.com` / `User123!`

## Contrato que espera del backend

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | `{ email, password }` | `{ accessToken, user }` |
| `GET` | `/api/v1/usage` | — | Snapshot de consumo de la empresa |
| `GET` | `/api/v1/users` | — | Directorio de empleados |
| `POST` | `/api/v1/licenses/assign` | `{ userId }` | Licencia asignada |

`user.role` es `Admin` o `User`. El error global del backend (`statusCode`, `path`, `error`) se muestra en la interfaz. Un `401` cierra la sesión.

Los tipos viven en `src/types/domain.ts`.
