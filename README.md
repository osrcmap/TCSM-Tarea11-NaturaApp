# NaturApp — App de Comercio Electrónico de Productos Naturales

Proyecto **full-stack** de la **Sesión 11 — Del Módulo a la App** (Taller de
Construcción de Software Móvil, UNMSM), en dos capas independientes:

- **`backend/`** — API REST con **Express.js 5 + MongoDB (Mongoose)**.
- **`mobile-client/`** — App móvil con **React Native + Expo Router**.

La app permite explorar productos (búsqueda, filtros, paginación), registrarse / iniciar
sesión, usar un carrito y confirmar pedidos. Usa arquitectura modular, endpoints RESTful,
autenticación con **JWT** y consumo de la API con estados de carga, pull-to-refresh y
manejo de errores.

---

## Tabla de contenido

1. [Arquitectura](#1-arquitectura)
2. [Base de datos con Docker](#2-base-de-datos-con-docker)
3. [Requisitos previos](#3-requisitos-previos)
4. [Backend](#4-backend)
5. [Frontend (móvil)](#5-frontend-móvil)
6. [Endpoints](#6-endpoints)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Flujo para probar](#8-flujo-para-probar)

---

## 1. Arquitectura

El backend y el frontend se ejecutan y despliegan por separado (patrón
**cliente–servidor desacoplado**):

- El **backend** maneja datos, reglas de negocio, seguridad (JWT, bcrypt) y persistencia
  en MongoDB. Define 4 modelos (`Category`, `Product`, `User`, `Order`) y rutas RESTful
  por recurso bajo `/api`. Un middleware (`middleware/auth.js`) protege rutas privadas y
  `authorize` restringe acciones de admin.
- El **frontend** solo se encarga de la presentación. Con **Expo Router** (rutas basadas
  en archivos) construye las pantallas (Inicio, Buscar, Carrito, Pedidos, Perfil, detalle,
  login/registro, checkout). Un servicio central (`src/services/apiService.js`) concentra
  las llamadas HTTP y el token; **hooks** (`useProducts`, `useCart`, `useAuth`,
  `useOrders`) encapsulan la lógica de cada dominio.

El estado del carrito y la sesión se comparte globalmente con **React Context**
(`context/CartContext.js`, `context/AuthContext.js`), reutilizando los hooks existentes.
Esto sostiene las mejoras de UX: popup "inicia sesión requerida", popup "producto
agregado" y un **badge** con la cantidad sobre el ícono del carrito.

> El móvil **pide datos** a la API por HTTP y recibe **JSON**. Nunca se conecta
> directamente a MongoDB; los secretos (`JWT_SECRET`, acceso a la BD) viven solo en el
> backend.

---

## 2. Base de datos con Docker

MongoDB corre en un contenedor para no instalar nada en el sistema. La **primera vez**:

```bash
docker run -d --name naturapp-mongo -p 27017:27017 -v naturapp-mongo-data:/data/db mongo:7
```

`-p 27017:27017` expone Mongo en `localhost:27017`; `-v naturapp-mongo-data` persiste los
datos aunque se reinicie el contenedor. El backend se conecta a
`mongodb://localhost:27017/naturapp`.

En sesiones siguientes basta con arrancarlo (no repetir `docker run`):

```bash
docker start naturapp-mongo   # iniciar
docker stop  naturapp-mongo   # detener (opcional)
docker ps                     # ver si corre
```

> Si al arrancar el backend sale `ECONNREFUSED`, casi siempre el contenedor no está
> corriendo: `docker start naturapp-mongo` y reintentar. También sirve MongoDB local o
> **Atlas** ajustando `MONGODB_URI`.

---

## 3. Requisitos previos

| Herramienta | Versión | Para qué |
|-------------|---------|----------|
| Node.js | 18+ | Backend y frontend |
| Docker Desktop | reciente | Contenedor de MongoDB |
| Expo Go | SDK 54 (celular) | Probar la app |

> No se necesita emulador: escanea el QR con **Expo Go**. El celular y la PC deben estar
> en la **misma red Wi-Fi**.

---

## 4. Backend

```bash
docker start naturapp-mongo    # MongoDB corriendo
cd backend
npm install
npm run seed                   # (la primera vez) categorías + productos + usuarios demo
npm run dev                    # servidor en http://localhost:9090
```

Verifica en `http://localhost:9090/api/health` → `{ "status": "ok", ... }`.

**Usuarios demo (seed):**

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@naturapp.com | admin123 | admin |
| cliente@naturapp.com | cliente123 | customer |

> Puedes definir `JWT_SECRET` y `MONGODB_URI` como variables de entorno; si no, se usan
> los valores por defecto del código.

---

## 5. Frontend (móvil)

### ⚠️ Paso obligatorio: IP del backend

El celular no puede usar `localhost` para llegar a tu PC. Obtén tu IP local (`ipconfig` en
Windows, `ip addr` en Linux/macOS) y edítala en
`mobile-client/src/services/apiService.js`:

```js
const BASE_URL = 'http://192.168.18.175:9090/api';  // ← pon TU IP
```

### Arrancar

```bash
cd mobile-client
npm install
npx expo start                 # muestra el QR
```

Escanea el QR con **Expo Go** (Android) o la cámara (iOS).

> En Expo instala paquetes con `npx expo install <paquete>` (no `npm install`) para que
> elija la versión compatible con el SDK 54.

---

## 6. Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Listar (filtros, búsqueda, paginación) | Público |
| GET | `/api/products/:id` | Detalle | Público |
| POST | `/api/products` | Crear | admin |
| PUT/DELETE | `/api/products/:id` | Actualizar / eliminar (lógico) | admin |
| GET | `/api/categories` | Listar categorías | Público |
| POST | `/api/users/register` | Registro (devuelve JWT) | Público |
| POST | `/api/users/login` | Login (devuelve JWT) | Público |
| GET/PUT | `/api/users/profile` | Ver / editar perfil | JWT |
| GET/POST | `/api/orders` | Listar / crear pedidos | JWT |
| PUT | `/api/orders/:id/cancel` | Cancelar (restaura stock) | JWT |
| GET | `/api/cart` | Ver carrito | JWT |
| POST | `/api/cart/add` | Agregar al carrito | JWT |
| PUT/DELETE | `/api/cart/:productId` | Actualizar / quitar item | JWT |
| DELETE | `/api/cart` | Vaciar carrito | JWT |

> El carrito del backend se guarda **en memoria** (`Map` por usuario), según la Sesión 11:
> se reinicia con el servidor. Productos, categorías, usuarios y pedidos sí persisten en
> MongoDB.

---

## 7. Estructura del proyecto

```
NaturApp/
├── backend/            # Express + MongoDB
│   ├── server.js                # entrada (conexión Mongo, CORS, rutas)
│   ├── seed.js                  # datos de ejemplo
│   ├── models/                  # Category, Product, User, Order
│   ├── routes/                  # product/category/user/order/cart Routes
│   └── middleware/auth.js       # JWT: authenticate / authorize
└── mobile-client/             # React Native + Expo Router
    ├── app/                     # rutas (file-based)
    │   ├── (tabs)/              # home, search, cart, orders, profile + _layout (badge)
    │   ├── product/[id].js      # detalle
    │   ├── auth/                # login, register
    │   ├── checkout.js          # confirmar pedido
    │   └── _layout.js           # raíz: monta los Context providers
    └── src/
        ├── services/apiService.js   # consumo de la API + token
        ├── context/            # AuthContext, CartContext
        ├── hooks/              # useProducts, useCart, useAuth, useOrders
        └── components/         # ProductCard, CartItemRow, CategoryChips
```

---

## 8. Flujo para probar

1. `docker start naturapp-mongo`.
2. Backend: `cd backend` → `npm run seed` (primera vez) → `npm run dev`.
3. Móvil: edita `BASE_URL` con tu IP → `npm install` → `npx expo start` → abre en Expo Go.
4. **Perfil → Iniciar Sesión** con `cliente@naturapp.com / cliente123`.
5. Explora **Inicio**, agrega al **Carrito** (sube el badge), ve a **Pago** y confirma un
   pedido. Revísalo en **Pedidos**.
6. Prueba agregar al carrito **sin** sesión: debe aparecer el aviso "inicia sesión
   requerida".
