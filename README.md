# Sammy Bowns — Tienda online + Panel administrativo + API

Landing page de accesorios para el cabello (lazos, diademas, clips, kits de
peinado), con panel administrativo y backend propio (API REST) que conecta
ambos. Los 104 productos y 11 categorías del catálogo son reales — se
migraron desde el proyecto anterior, no son datos de ejemplo.

## 1. Descripción del proyecto

- **frontend/** — la tienda pública (`index.html`). Cualquiera puede
  entrar, buscar, filtrar por categoría, armar su carrito y finalizar la
  compra por WhatsApp, **sin necesidad de crear una cuenta**.
- **dashboard/** — panel exclusivo del administrador. Requiere iniciar
  sesión contra el backend para gestionar productos, categorías e
  información de la tienda.
- **backend/** — API REST (Node.js + Express) que sirve los datos al
  frontend y al dashboard, y protege con autenticación (JWT) todas las
  operaciones de escritura.

## 2. Arquitectura

```
Cliente (navegador)
   │
   ├── frontend/index.html  ──┐
   │                          │  GET /api/products, /api/categories, /api/site
   └── dashboard/dashboard.html│  (+ POST/PUT/PATCH/DELETE con JWT para el admin)
                              ▼
                     backend/server.js (Express)
                              │
                              ▼
                 backend/data/*.json (persistencia)
```

El frontend y el dashboard son **100% estáticos** (HTML/CSS/JS sin
compilación) — se pueden publicar en GitHub Pages. El backend es la única
parte que necesita un servidor Node.js corriendo.

## 3. Estructura de carpetas

```
/
├── frontend/                 Tienda pública (deploy en GitHub Pages)
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   │   ├── config.js         URL del backend (API_BASE_URL)
│   │   └── script.js         Catálogo, carrito, búsqueda, checkout WhatsApp
│   └── img/                  Fotos reales de productos y categorías
│       ├── Logo.jpeg
│       ├── clips_variados/
│       ├── coleccion_bebes/  (vacía: aún sin fotos — ver sección 20)
│       ├── coleccion_escolar/
│       ├── coleccion_princesas/
│       ├── colombia/
│       ├── combos_promo/
│       ├── diademas/
│       ├── fiestas/          (vacía: aún sin fotos)
│       ├── kanekalon/        (vacía: aún sin fotos)
│       ├── kit_para_peinados/
│       └── navidad/
│
├── dashboard/                 Panel administrativo (deploy junto al frontend)
│   ├── dashboard.html
│   ├── css/dashboard.css
│   └── js/
│       ├── config.js          Misma URL del backend que frontend/js/config.js
│       └── dashboard.js       Login + CRUD contra la API
│
├── backend/                   API REST (deploy en un servicio Node.js aparte)
│   ├── server.js
│   ├── package.json
│   ├── .env                   Credenciales REALES para correr localmente (NO se sube a git)
│   ├── .env.example           Plantilla sin secretos
│   ├── .gitignore
│   ├── routes/                auth / products / categories / site
│   ├── controllers/           Lógica de cada recurso + validación de datos
│   ├── middleware/            requireAuth (JWT) y manejo de errores
│   └── data/
│       ├── db.js              Acceso centralizado a los JSON (escritura atómica)
│       ├── products.json      104 productos reales
│       ├── categories.json    11 categorías reales
│       └── site.json          Nombre, frase, contacto, redes, WhatsApp
│
├── .gitignore                 Raíz del repo
└── README.md                  Este archivo
```

**Por qué el logo se ve en `dashboard/` sin duplicar el archivo:** el
dashboard referencia `../frontend/img/Logo.jpeg` y `../frontend/css/styles.css`
(carpetas hermanas) en vez de tener su propia copia — se evita duplicar
imágenes.

## 4. Frontend

`frontend/js/script.js` ya no tiene los productos escritos a mano: al
cargar la página hace `fetch` a `/api/products`, `/api/categories` y
`/api/site`. Si el backend no responde (servidor caído, sin internet), usa
la última copia guardada en `localStorage` como respaldo, para no dejar la
tienda completamente vacía.

Funcionalidades (todas conservadas del proyecto anterior):
- Catálogo con sidebar de categorías (imagen real o emoji + contador).
- Buscador (por nombre y categoría), con mensaje de "sin resultados".
- Ordenar por: relevancia, más cotizado, precio, alfabético, más reciente/antiguo.
- Carrito sin registro: agregar, cambiar cantidades, eliminar, ver total.
- Botón flotante de WhatsApp con mensaje configurable.
- Menú hamburguesa en móvil con categorías y navegación.
- Acceso discreto al dashboard: doble clic (o mantener presionado en
  celular) sobre el logo.

## 5. Backend

API REST mínima y sin dependencias innecesarias: `express`, `cors`,
`dotenv`, `jsonwebtoken`, `bcryptjs`.

| Método | Ruta                  | Auth | Descripción                          |
|--------|-----------------------|:----:|---------------------------------------|
| POST   | `/api/auth/login`     | No   | Login del admin → devuelve JWT        |
| GET    | `/api/auth/verify`    | Sí   | Verifica si el token sigue siendo válido |
| GET    | `/api/products`       | No   | Lista de productos (tienda pública)   |
| POST   | `/api/products`       | Sí   | Crear producto                        |
| PUT/PATCH | `/api/products/:id` | Sí   | Editar producto                       |
| DELETE | `/api/products/:id`   | Sí   | Eliminar producto                     |
| GET    | `/api/categories`     | No   | Lista de categorías                   |
| POST   | `/api/categories`     | Sí   | Crear categoría                       |
| PUT/PATCH | `/api/categories/:id` | Sí | Editar categoría (renombrar reasigna productos) |
| DELETE | `/api/categories/:id` | Sí   | Eliminar (bloqueado si hay productos usándola: 409) |
| GET    | `/api/site`           | No   | Información pública de la tienda      |
| PUT/PATCH | `/api/site`         | Sí   | Editar información de la tienda       |

La persistencia es en archivos JSON (`backend/data/`), con escritura
atómica (archivo temporal + rename) para no corromper los datos si el
proceso se interrumpe a mitad de un guardado. Es intencionalmente simple
porque el catálogo es pequeño — está aislada detrás de `data/db.js`, así
que migrar a una base de datos real más adelante no requiere tocar el
resto del backend.

## 6. Dashboard

Accesible solo mediante doble clic (o mantener presionado en móvil) sobre
el logo de la tienda — no aparece en ningún menú público. Al entrar sin
sesión válida, `dashboard.js` verifica el token contra el backend
(`GET /api/auth/verify`) y, si no es válido, muestra el login — **la
protección real vive en el backend**, no en ocultar el HTML.

Secciones: Resumen (estadísticas), Productos (crear/editar/eliminar/activar),
Categorías (crear/editar/eliminar — bloqueado si hay productos asociados),
Información de la tienda (nombre, frase, contacto, WhatsApp, redes
sociales).

## 7. API — ejemplos rápidos

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ventasammybowns@gmail.com","password":"tu-contraseña"}'

# Crear un producto (usando el token que devolvió el login)
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"name":"Moño Satinado Rosa","category":"Diademas","price":25000}'
```

## 8. Variables de entorno

Ver `backend/.env.example`. Resumen:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 4000) |
| `ADMIN_EMAIL` | Correo del administrador |
| `ADMIN_PASSWORD_HASH` | Hash **bcrypt** de la contraseña (nunca la contraseña en texto plano) |
| `JWT_SECRET` | Cadena aleatoria larga para firmar los tokens de sesión |
| `JWT_EXPIRES_IN` | Duración de la sesión (ej. `2h`) |
| `CORS_ORIGIN` | Dominios permitidos para consumir la API, separados por coma |

Generar un hash bcrypt nuevo (por ejemplo, para cambiar la contraseña):
```bash
node -e "console.log(require('bcryptjs').hashSync('tu-nueva-contraseña', 12))"
```
Generar un `JWT_SECRET` nuevo:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 9. Instalación

```bash
cd backend
npm install
```

El frontend y el dashboard no requieren instalación (HTML/CSS/JS puro).

## 10. Ejecución local

```bash
# Terminal 1 — backend
cd backend
npm start
# Escuchando en http://localhost:4000

# Terminal 2 — frontend + dashboard (cualquier servidor estático)
cd ..
python3 -m http.server 5500
# Tienda:     http://localhost:5500/frontend/index.html
# Dashboard:  http://localhost:5500/dashboard/dashboard.html
```

`backend/.env` ya trae credenciales de prueba funcionando para que puedas
entrar al dashboard de inmediato (ver sección 11). **Cámbialas antes de
publicar el sitio.**

## 11. Configuración del administrador

Credenciales de prueba incluidas en `backend/.env` (local, no se sube a git):
- **Correo:** `ventasammybowns@gmail.com`
- **Contraseña:** `sammy2026`

Para producción, genera tus propias credenciales (sección 8) y configúralas
como variables de entorno en tu servicio de hosting del backend — nunca
las escribas en ningún archivo del frontend/dashboard.

## 12. CRUD

Ver tabla de la sección 5. Todo el CRUD (crear/editar/eliminar productos y
categorías, editar información de la tienda) requiere el token del admin;
sin él, el backend responde `401` sin importar qué haga el frontend.

## 13. Carrito

Sin registro. Persiste en `localStorage` del navegador del cliente
(independiente del backend — el carrito es solo del dispositivo del
cliente). Flujo: agregar → ajustar cantidades → ver total → **Finalizar
compra por WhatsApp**.

## 14. WhatsApp

El botón flotante y el checkout arman automáticamente el link
`https://wa.me/<número>?text=<mensaje>` usando el número y el mensaje
configurados en **Información de la tienda** del dashboard (o los valores
por defecto si nunca se han editado).

## 15. Deploy del frontend (GitHub Pages)

1. En la configuración de GitHub Pages del repositorio, elige la carpeta
   `frontend` como origen (Settings → Pages → Source → selecciona la rama
   y la carpeta `/frontend`; o copia el contenido de `frontend/` a una
   rama `gh-pages`/carpeta `docs` si tu flujo de trabajo lo requiere).
2. Haz lo mismo para `dashboard/` (puede vivir en la misma publicación,
   GitHub Pages sirve cualquier carpeta del sitio).
3. `frontend/js/config.js` y `dashboard/js/config.js` eligen solos el
   backend: el local si la página se abre desde `localhost`, y el de Render
   (`PRODUCTION_API_URL`) si se abre desde GitHub Pages.

## 16. Deploy del backend (Render gratis + MongoDB Atlas)

El plan gratis de Render borra los archivos del servidor en cada reinicio,
así que en producción los datos y las fotos subidas se guardan en MongoDB
Atlas (plan gratis M0). En tu PC, sin `MONGODB_URI`, todo sigue en
`backend/data/*.json` y `backend/uploads/`.

1. En MongoDB Atlas: crea un cluster gratis (M0), un usuario de base de
   datos y, en **Network Access**, permite `0.0.0.0/0` (Render gratis no
   tiene IP fija). Copia la cadena de conexión `mongodb+srv://...`.
2. En Render: **New > Blueprint** y elige este repositorio (usa
   `render.yaml`). Completa `MONGODB_URI`, `ADMIN_EMAIL` y
   `ADMIN_PASSWORD_HASH` (el hash de tu `.env`). `JWT_SECRET` se genera
   solo.
3. La primera vez, como la base está vacía, el backend usa los datos de
   `backend/data/`. Desde el primer guardado en el dashboard, los cambios
   quedan en MongoDB, no en el repositorio.
4. Si la URL final no es `https://sammy-bowns-api.onrender.com`, cámbiala
   en `PRODUCTION_API_URL` de `frontend/js/config.js` y
   `dashboard/js/config.js`. Abiertos desde `localhost`, ambos siguen
   usando el backend local.

Render gratis apaga el servicio tras 15 minutos sin visitas; la primera
visita después tarda cerca de un minuto en responder. Mientras tanto la
tienda muestra la última copia guardada en el navegador.

## 17. Configuración de CORS

`backend/server.js` solo permite los orígenes listados en `CORS_ORIGIN`
(separados por coma). En desarrollo local se incluyen los puertos típicos
de servidores estáticos (5500, 3000). En producción, reemplázalos por el
dominio real de GitHub Pages — evita dejar `*` si no es necesario.

## 18. Seguridad

- La contraseña del administrador nunca está en texto plano: solo su hash
  **bcrypt** vive en `ADMIN_PASSWORD_HASH` (variable de entorno del
  backend).
- El frontend/dashboard nunca reciben la contraseña ni su hash — solo un
  token JWT de corta duración tras un login exitoso.
- Todas las rutas de escritura (`POST`/`PUT`/`PATCH`/`DELETE` de
  productos, categorías e información del sitio) están protegidas en el
  **backend** con el middleware `requireAuth`; llamarlas sin un token
  válido devuelve `401` sin importar qué haga el frontend — se probó
  explícitamente con `curl` sin token.
- `.env` está en `.gitignore`: nunca se sube al repositorio.
- CORS restringido a los orígenes configurados.
- Los datos de entrada se validan en cada controlador (nombre, precio,
  categoría, etc.) antes de guardarse.
- Los mensajes de error nunca incluyen el stack trace ni detalles internos.

## 19. Mantenimiento

- Para agregar fotos a las categorías aún vacías (`coleccion_bebes`,
  `fiestas`, `kanekalon`): sube las imágenes a su carpeta dentro de
  `frontend/img/` y crea los productos correspondientes desde el
  dashboard, indicando esa ruta relativa (ej.
  `img/coleccion_bebes/mi-foto.jpg`).
- Si necesitas editar un producto o categoría en lote, puedes modificar
  directamente `backend/data/products.json` /
  `backend/data/categories.json` con el servidor detenido (son JSON planos
  y legibles) — al reiniciar el servidor, los cambios se sirven tal cual.

## 20. Solución de problemas comunes

**"No se pudo conectar con el servidor" en el dashboard o la tienda:**
el backend no está corriendo, o `config.js` apunta a una URL incorrecta.
Verifica `npm start` en `backend/` y que `API_BASE_URL` en
`frontend/js/config.js` / `dashboard/js/config.js` sea la correcta.

**Login rechazado con credenciales que crees correctas:** confirma que
`ADMIN_EMAIL` y `ADMIN_PASSWORD_HASH` en `backend/.env` correspondan
realmente a esa contraseña (regenera el hash si tienes dudas, sección 8).

**Imágenes rotas:** confirma que la ruta en `products.json`/
`categories.json` (campo `image`) coincide exactamente con el archivo
dentro de `frontend/img/<categoría>/`, incluyendo mayúsculas/acentos. Este
proyecto tuvo justamente ese problema — algunos nombres de archivo con
tildes (Ñ, Ó) llegaron corrompidos como `#U00d1`/`#U00d3` en un ida y
vuelta por GitHub en un entorno Windows; ya se corrigieron los 12 archivos
afectados en esta entrega. Si vuelve a pasar al subir fotos nuevas,
revisa la configuración de codificación de nombres de archivo de tu
cliente Git (`git config core.quotepath false` suele ayudar) o evita
tildes/eñes en los nombres de archivo nuevos como prevención.

**CORS bloqueando las peticiones:** agrega el origen exacto (protocolo +
dominio + puerto) desde el que sirves el frontend a `CORS_ORIGIN` en
`backend/.env`.

**El dashboard no reconoce la sesión tras recargar:** la sesión vive en
`sessionStorage` (se borra al cerrar la pestaña) y se revalida contra el
backend en cada carga — si el token venció (por defecto, 2 horas) hay que
iniciar sesión de nuevo; es el comportamiento esperado.