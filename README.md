# Sammy Bowns — Tienda online

Landing page / tienda online de accesorios para el cabello (lazos, diademas,
clips, kits de peinado, etc.), con panel administrativo separado para
gestionar productos, categorías e información de la marca.

## 1. Descripción del proyecto

Sitio de una sola tienda (Sammy Bowns) con:
- Catálogo de productos organizado por categorías reales del negocio.
- Buscador, filtros por categoría y ordenamiento.
- Carrito de compra sin necesidad de registro, con checkout por WhatsApp.
- Panel administrativo (`dashboard.html`) para gestionar el catálogo sin
  tocar código.

## 2. Objetivo

Permitir que el dueño de la tienda reciba pedidos por WhatsApp desde una
página moderna y navegable, y que pueda mantener el catálogo actualizado
(agregar/editar/quitar productos y categorías) sin depender de un
desarrollador para cada cambio.

## 3. Tecnologías

- HTML5, CSS3, JavaScript (vanilla, sin frameworks ni build step).
- `localStorage` del navegador como almacenamiento de contenido (productos,
  categorías, información de la tienda) mientras no exista un backend.
- Sin backend propio incluido en esta entrega — ver sección 10 para lo que
  hace falta agregar para producción.

## 4. Estructura de carpetas

```
Sammy (Pr)/
├── index.html          Tienda pública
├── styles.css          Estilos de la tienda pública
├── script.js           Lógica de la tienda pública (catálogo, carrito, etc.)
├── dashboard.html       Panel administrativo
├── dashboard.css        Estilos del panel administrativo
├── dashboard.js         Lógica del panel administrativo
├── README.md            Este documento
└── img/
    ├── Logo.jpeg
    ├── coleccion_escolar/    (fotos reales de esta categoría)
    ├── coleccion_princesas/
    ├── coleccion_bebes/      (vacía por ahora — agrega fotos aquí)
    ├── fiestas/              (vacía por ahora)
    ├── navidad/
    ├── diademas/
    ├── clips_variados/
    ├── kanekalon/            (vacía por ahora)
    ├── kit_para_peinados/
    ├── colombia/
    └── combos_promo/
```

Esta estructura de `img/` ya existía en el proyecto (una carpeta por
categoría) y se respetó tal cual — no se inventaron rutas ni carpetas
nuevas. Los productos actuales usan directamente las fotos que ya estaban
en cada carpeta.

## 5. Estructura de imágenes

- Cada categoría tiene su propia carpeta dentro de `img/`.
- El nombre y precio de cada producto se generaron automáticamente a partir
  del nombre del archivo (ejemplo: `PAR ESCOLAR REF 001_24000.jpeg` se
  convirtió en el producto "Par Escolar REF 001" a $24.000). Revisa esos
  nombres/precios desde el panel y ajusta lo que no sea exacto.
- Las categorías `coleccion_bebes`, `fiestas` y `kanekalon` ya existen como
  categorías activas en la tienda, pero sus carpetas de imágenes están
  vacías — agrega ahí las fotos reales y luego crea los productos
  correspondientes desde el panel.

## 6. Funcionamiento de categorías

- Las categorías se muestran en una barra lateral en escritorio (con foto o
  emoji + nombre + cantidad de productos) y dentro del menú hamburguesa en
  móvil.
- Al seleccionar una categoría se actualiza el título, la cantidad de
  resultados, el banner (si la categoría tiene foto) y la grilla de
  productos — todo sin recargar la página.
- "Todos los productos" vuelve a mostrar el catálogo completo.

## 7. Funcionamiento del carrito

- El cliente agrega productos sin necesidad de iniciar sesión ni
  registrarse.
- Se pueden aumentar/disminuir cantidades y eliminar productos desde el
  modal del carrito.
- "Finalizar compra por WhatsApp" arma automáticamente un mensaje con el
  resumen del pedido (productos, cantidades, total) y lo abre en WhatsApp.

## 8. Funcionamiento del buscador

- Input de búsqueda en el header (escritorio) y detrás del ícono de lupa
  (móvil). Busca por nombre de producto y por categoría, en tiempo real.
- Estos dos bloques de búsqueda (escritorio/móvil) están completamente
  desacoplados del resto del sitio: cada elemento se busca de forma
  independiente en `script.js` y se comprueba que exista antes de usarlo.
  Si en algún momento se elimina o rediseña la barra de búsqueda móvil,
  categorías, carrito, menú y navegación seguirán funcionando con
  normalidad.

## 9. Funcionamiento del dashboard

`dashboard.html` es un archivo completamente separado de la tienda pública.
Se accede de forma discreta desde el logo de `index.html`:
- **Escritorio:** doble clic sobre el logo.
- **Móvil:** mantener presionado el logo (~700 ms).

Un clic normal en el logo sigue llevando a la tienda con normalidad —el
acceso administrativo no es visible ni evidente para un cliente común.

Dentro del dashboard hay tres secciones: **Productos**, **Categorías** e
**Información de la tienda**, además de un resumen con estadísticas
básicas. Los cambios se guardan de inmediato y se reflejan en la tienda
pública sin recargar nada manualmente (ambos archivos leen/escriben las
mismas claves de `localStorage`).

## 10. Sistema de autenticación — LEE ESTO ANTES DE USAR EL PANEL

**Este proyecto es actualmente solo frontend.** Por eso, y siguiendo buenas
prácticas de seguridad, `dashboard.js` **no contiene ninguna contraseña**,
ni siquiera en forma de hash o de ejemplo. La pantalla de login llama a:

```
POST /api/admin/login   { email, password } → { token, expiresAt }
GET  /api/admin/verify  (Authorization: Bearer <token>) → 200 si es válido
POST /api/admin/logout  (Authorization: Bearer <token>)
```

**Mientras ese backend no exista, el login fallará mostrando un aviso.**
Esto es intencional: es preferible que el panel no funcione a que simule
una seguridad falsa comparando `email`/`password` dentro del JavaScript del
navegador (cualquier persona podría leer y burlar esa lógica con las
herramientas de desarrollador del navegador).

### Ejemplo de backend mínimo (Node.js + Express + bcrypt + JWT)

Esto es una **referencia**, no está incluida en el proyecto ni desplegada.
Debes crearla en un servidor propio (o función serverless) y **nunca**
subir el archivo `.env` a ningún repositorio público.

```js
// server.js (ejemplo de referencia — no incluido en este proyecto)
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Variables de entorno (NUNCA en el frontend ni en el repositorio):
// ADMIN_EMAIL=ventasammybowns@gmail.com
// ADMIN_PASSWORD_HASH=<hash bcrypt generado UNA VEZ con bcrypt.hash(password, 12)>
// JWT_SECRET=<cadena aleatoria larga>

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const validEmail = email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  const validPassword = validEmail && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!validEmail || !validPassword) {
    return res.status(401).json({ message: "Correo o contraseña incorrectos." });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, expiresAt: Date.now() + 2 * 60 * 60 * 1000 });
});

app.get("/api/admin/verify", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.sendStatus(200);
  } catch {
    res.sendStatus(401);
  }
});

app.post("/api/admin/logout", (req, res) => {
  // Con JWT sin estado no hay nada que invalidar en el servidor a menos que
  // se use una lista de revocación / Redis. Aquí basta con responder 200;
  // el frontend borra el token de sessionStorage.
  res.sendStatus(200);
});

app.listen(3000);
```

Para generar el hash de la contraseña UNA sola vez (en tu máquina, nunca en
el frontend):

```js
const bcrypt = require("bcrypt");
bcrypt.hash("la-contraseña-real", 12).then(console.log);
```

Ese hash resultante es el que va en la variable de entorno
`ADMIN_PASSWORD_HASH` del servidor — nunca en el código del sitio.

### Buenas prácticas adicionales recomendadas para producción

- Servir el sitio y la API por HTTPS.
- Usar cookies `HttpOnly` + `Secure` en vez de guardar el token en
  `sessionStorage`, si el backend y el frontend comparten dominio.
- Limitar los intentos de login (rate limiting) para evitar fuerza bruta.
- Expirar el token (ya contemplado arriba con `expiresIn`) y revalidar la
  sesión en cada carga del dashboard (ya implementado en `dashboard.js`
  mediante `GET /api/admin/verify`).
- Cuando el backend maneje también los productos/categorías, cada endpoint
  de escritura (crear/editar/eliminar) debe validar el token igual que
  `/api/admin/verify` — no basta con ocultar los botones en el frontend.

## 11. CRUD

Mientras no exista backend, el CRUD de productos, categorías e información
de la tienda funciona guardando en `localStorage` (una vez que se ha
iniciado sesión correctamente). Las funciones `saveProducts()`,
`saveCategories()` y `saveConfig()` en `dashboard.js` están centralizadas
para que, cuando el backend esté listo, sea sencillo reemplazarlas por
llamadas `fetch()` autenticadas (`Authorization: Bearer <token>`) a tus
propios endpoints (`/api/products`, `/api/categories`, `/api/config`).

- **Productos:** crear, editar, eliminar, activar/desactivar, marcar como
  destacado o en promoción, cambiar nombre/descripción/precio/precio
  anterior/categoría/imagen.
- **Categorías:** crear, editar, eliminar, cambiar nombre/emoji/imagen.
- **Información de la tienda:** nombre, frase de marca, correo, WhatsApp
  (número y mensaje inicial), TikTok, Instagram.

## 12. Configuración

Los valores por defecto (antes de que el administrador guarde cambios)
viven en `script.js`, en las constantes `DEFAULT_CONFIG`,
`DEFAULT_CATEGORIES` y `DEFAULT_PRODUCTS`.

## 13. Variables de entorno

No aplica al frontend actual (no debe llevar secretos). Para el backend de
referencia de la sección 10: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`,
`JWT_SECRET`.

## 14. Instalación

No requiere instalación de dependencias para la parte frontend. Basta con
servir la carpeta con cualquier servidor estático (o abrir `index.html`
directamente en el navegador para pruebas rápidas).

## 15. Ejecución

```
# Opción simple con Python (o cualquier servidor estático equivalente)
cd "Sammy (Pr)"
python3 -m http.server 8080
```

Luego visita `http://localhost:8080/index.html` para la tienda y
`http://localhost:8080/dashboard.html` para el panel (recuerda que el login
no funcionará hasta desplegar el backend de la sección 10).

## 16. Configuración para producción

1. Desplegar el backend de autenticación (sección 10) con HTTPS.
2. Migrar productos/categorías/información de la tienda de `localStorage` a
   una base de datos real, sirviéndolos también a través de tu API.
3. Servir `index.html`/`dashboard.html` desde un hosting con HTTPS.
4. Revisar los enlaces reales de TikTok e Instagram en `script.js`
   (`DEFAULT_CONFIG.tiktok` / `DEFAULT_CONFIG.instagram`) — actualmente son
   placeholders.

## 17. Seguridad

- La contraseña del administrador **nunca** está en el código del
  frontend.
- El acceso al dashboard requiere un token válido emitido por el backend;
  ese token se revalida en cada carga (`/api/admin/verify`), así que
  revocar el acceso o cerrar sesión tiene efecto real y no depende
  únicamente de ocultar botones con CSS.
- Sin backend desplegado, el panel simplemente no deja entrar — es un
  comportamiento intencional, no un error.

## 18. Mantenimiento

- Para agregar productos de las categorías aún vacías (`coleccion_bebes`,
  `fiestas`, `kanekalon`): sube las fotos a su carpeta dentro de `img/` y
  crea los productos desde el panel indicando esa ruta de imagen.
- Revisa periódicamente que los nombres/precios generados automáticamente
  desde los archivos de imagen sigan siendo correctos.

## 19. Rutas principales

- `/index.html` — tienda pública.
- `/dashboard.html` — panel administrativo (acceso vía doble clic /
  mantener presionado el logo de la tienda).

## 20. Consideraciones importantes

- El proyecto sigue siendo 100% funcional como tienda pública sin backend:
  catálogo, búsqueda, carrito y checkout por WhatsApp funcionan hoy mismo.
- El panel administrativo está completo en su interfaz, pero **requiere el
  backend de autenticación** antes de poder iniciar sesión — esto es
  deliberado para no exponer una seguridad falsa.
- No se eliminó ninguna funcionalidad existente de la tienda pública; el
  panel administrativo se movió a sus propios archivos para mantener la
  arquitectura organizada, tal como se solicitó.
