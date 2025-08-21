# Book Joy

**Book Joy** es una aplicación web full-stack para la gestión de reservas de apartamentos turísticos.  
Fue desarrollada como proyecto académico en el Bootcamp de Full Stack Web Development, con el objetivo de aplicar **Node.js, Express, MongoDB y EJS** en un caso práctico realista.

---

## Descripción

Book Joy permite a usuarios explorar apartamentos disponibles con filtros avanzados (capacidad, ciudad, precio, fechas), ver detalles completos con fotos, servicios y ubicación en mapa, y reservar online.  
Los administradores pueden añadir, editar, cancelar apartamentos y gestionar fotos, servicios y reglas de cada propiedad.

---

## Tecnologías utilizadas

- **Backend:** Node.js, Express
- **Base de datos:** MongoDB (local y MongoDB Atlas en despliegue)
- **ORM:** Mongoose
- **Plantillas:** EJS
- **Sesiones y autenticación:** express-session
- **Estilos:** Bootstrap 5 + CSS personalizado
- **Despliegue:** Render

---

## Estructura del proyecto

```
Book-Joy/
│── models/               # Modelos de Mongoose (Apartments, Users, etc.)
│── routes/               # Rutas separadas (index, admin, auth, api)
│── controllers/          # Lógica de negocio para cada recurso
│── views/                # Vistas EJS (home, apartment-detail, add-apartment, etc.)
│── public/               # Archivos estáticos (CSS, imágenes, JS cliente)
│── utils/                # Configuración de base de datos y utilidades
│── .env                  # Variables de entorno (no subir a GitHub)
│── index.js              # Punto de entrada principal
│── package.json
│── README.md
```

---

## Características principales

- Página principal con **filtros de búsqueda** (huéspedes, ciudad, fechas, precios, orden).
- Sección hero con buscador y contador de resultados.
- **Tarjetas de apartamentos** con fotos, precio, superficie, capacidad y servicios.
- **Vista detalle** de cada apartamento con galería, descripción, reglas, ubicación (Google Maps) y reservas.
- **Panel de administración** con autenticación:
  - Añadir nuevos apartamentos.
  - Editar y eliminar (soft delete) apartamentos existentes.
  - Marcar un apartamento como **activo/inactivo**.
  - Subir varias fotos y elegir **foto principal**.
- Base de datos en MongoDB Atlas para disponibilidad online.
- Diseño responsive con Bootstrap 5.

---

## Instalación y uso

1. Clonar el repositorio:  
   ```bash
   git clone https://github.com/usuario/Book-Joy.git
   cd Book-Joy
   ```

2. Instalar dependencias:  
   ```bash
   npm install
   ```

3. Configurar variables de entorno (`.env`):  
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/Book-Joy
   SESSION_SECRET=un-secreto-largo-y-aleatorio
   NODE_ENV=development
   ```

4. Ejecutar en desarrollo:  
   ```bash
   npm run dev
   ```

5. Iniciar en producción:  
   ```bash
   npm start
   ```

---

## Principales retos y su solución
 
1. **Formulario de fotos principales**  
   - **Problema:** al añadir un apartamento nuevo, la foto marcada como principal no se guardaba en la base de datos (todas quedaban con `isMain: false`).  
   - **Solución:** modificar el formulario para usar `checkboxes` en lugar de `radio buttons` que había implementado anteriormente y añadiendo un pequeño script de **JavaScript** para:
      1) forzar que solo **un** checkbox pueda estar activo a la vez, y  
      2) **sincronizar** el valor enviando un `input` oculto `photos[i][isMain]=true` para la foto seleccionada (y `false` para las demás).  
     Así evité cambios grandes en el backend y logré que `isMain` se guarde correctamente en MongoDB Atlas desde la creación.  
   

2. **Ruta de creación de apartamentos (Cannot POST /admin/apartment)**  
   - **Problema:** El formulario de creación apuntaba a `/admin/apartment`, pero en las rutas `(adminRoutes.js)` se esperaba `/admin/apartment/add-new`.  
   - **Solución:** Ajustar el `action` del formulario en `add-apartment.ejs` para que coincidiera con la ruta del backend. 

3. **Diseño responsive del buscador (Hero Search)**  
   - **Problema:** al crear la sección de filtros en la página principal, el hero quedaba pegado a las tarjetas de los apartamentos y las imágenes no ocupaban todo el ancho.  
   - **Solución:** ajustar el CSS con un `background-image` en `.hero-search` y añadir márgenes inferiores para mantener separación visual. También centré las tarjetas en filas de 3 para mejorar la usabilidad.  
 
---

## Autor

**Christian Barón**  
Proyecto académico del módulo Backend (UF1845)  
Bootcamp Full Stack Web Development (Ironhack).

---
