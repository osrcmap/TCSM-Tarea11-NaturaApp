# NaturApp

E-commerce de productos naturales. Monorepo de dos paquetes independientes:

- **`backend/`** — API REST (Express 5, MongoDB/Mongoose, JWT).
- **`mobile-client/`** — App móvil (React Native, Expo Router).

Catálogo con búsqueda, filtros y paginación; autenticación con JWT; carrito y pedidos.

## Diseño

- **Modelos:** `Category`, `Product`, `User`, `Order`.
- **Rutas** RESTful por recurso bajo `/api`. `middleware/auth.js` expone
  `authenticate` / `authorize`; las altas y ediciones de producto quedan tras rol `admin`.
- **Cliente:** `apiService.js` centraliza HTTP y el token; un hook por dominio
  (`useProducts`, `useCart`, `useAuth`, `useOrders`). El carrito y la sesión viven en
  `AuthContext` / `CartContext` para mantener sincronizados el badge del tab y el flujo de
  "login requerido" entre pantallas.

## Requisitos

Node 18+, Docker y Expo Go (SDK 54). El dispositivo y la máquina deben compartir red.

## Backend

```bash
docker start naturapp-mongo 2>/dev/null || \
  docker run -d --name naturapp-mongo -p 27017:27017 -v naturapp-mongo-data:/data/db mongo:7

cd backend
npm install
npm run seed     # categorías, productos y usuarios demo
npm run dev      # http://localhost:9090
```

Configuración por entorno (con defaults): `MONGODB_URI`
(`mongodb://localhost:27017/naturapp`) y `JWT_SECRET`.

Usuarios del seed:

| Email | Password | Rol |
|-------|----------|-----|
| admin@naturapp.com | admin123 | admin |
| cliente@naturapp.com | cliente123 | customer |

## Mobile

Apunta `BASE_URL` a la IP LAN de tu máquina; el dispositivo no resuelve `localhost`:

```js
// mobile-client/src/services/apiService.js
const BASE_URL = 'http://192.168.18.175:9090/api';
```

```bash
cd mobile-client
npm install
npx expo start
```

## API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Healthcheck | — |
| GET | `/api/products` | Listar (filtros, búsqueda, paginación) | — |
| GET | `/api/products/:id` | Detalle | — |
| POST | `/api/products` | Crear | admin |
| PUT/DELETE | `/api/products/:id` | Actualizar / baja lógica | admin |
| GET | `/api/categories` | Listar categorías | — |
| POST | `/api/users/register` | Registro → JWT | — |
| POST | `/api/users/login` | Login → JWT | — |
| GET/PUT | `/api/users/profile` | Ver / editar perfil | JWT |
| GET/POST | `/api/orders` | Listar / crear pedidos | JWT |
| PUT | `/api/orders/:id/cancel` | Cancelar (restaura stock) | JWT |
| GET | `/api/cart` | Ver carrito | JWT |
| POST | `/api/cart/add` | Agregar ítem | JWT |
| PUT/DELETE | `/api/cart/:productId` | Actualizar / quitar ítem | JWT |
| DELETE | `/api/cart` | Vaciar carrito | JWT |

> El carrito vive en memoria (`Map` por usuario) y se reinicia con el proceso; el resto
> persiste en MongoDB.

## Estructura

```
backend/
├── server.js              # conexión Mongo, CORS, montaje de rutas
├── seed.js
├── models/                # Category, Product, User, Order
├── routes/                # product / category / user / order / cart
└── middleware/auth.js     # authenticate / authorize

mobile-client/
├── app/                   # rutas file-based de Expo Router
│   ├── (tabs)/            # home, search, cart, orders, profile (+ badge en _layout)
│   ├── product/[id].js
│   ├── auth/              # login, register
│   ├── checkout.js
│   └── _layout.js         # providers de contexto
└── src/
    ├── services/apiService.js
    ├── context/           # AuthContext, CartContext
    ├── hooks/             # useProducts, useCart, useAuth, useOrders
    └── components/        # ProductCard, CartItemRow, CategoryChips
```
