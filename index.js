import express from 'express';
import { connectDB } from './utils/db.js';
import session from 'express-session';
import cors from 'cors';

// importamos del fichero correspondiente todas las rutas que tienen que ver con los usuarios generales
import indexRoutes  from './routes/indexRoutes.js'; 

// importar el fichero que contiene las rutas de administrador
import adminRoutes from './routes/adminRoutes.js';

// importar el fichero que contiene las rutas para gestionar la autentificación
import authRoutes from './routes/authRoutes.js';

// importar las rutas de la api
import apiRoutes from './routes/apiRoutes.js';

// Creamos una instancia de express para definir los endpoints

const app = express();

// Poder procesar información de los formularios
app.use(express.urlencoded({extended: true}));

// Configurar sesión
app.use(session({
    secret: 'miSecretoSuperSecreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // secure: true en producción con HTTPS
}));

// Vamos a configurar unas variables para que SIEMPRE esten disponibles en todas las vistas, sin tenerlas que pasar de forma explícita des de el controlador
app.use((req, res, next)=> {
    // La propiedad locals permite que las variables que esten dentro de este objeto esten presentes en todas las vistas, y las puedas usar en el EJS
    res.locals.isAuthenticated = req.session.isAuthenticated;

    // Nos traemos el mensaje informativo que tenga el servidor para el cliente, y lo guardamos en la variable res.locals.info . La variable 'info' está presente en todas las vistas
    res.locals.info = req.session.info;

    // Luego, eliminamos el mensaje de la variable de sesión para que cuando el usuario "recargue" (vuelva a hacer una petición al servidor) no sigamos viendo el mismo mensaje
    req.session.info = undefined;
    next();
});

// Middleware para proteger las rutas de administrador
app.use('/admin', (req, res, next) => {
    // Miramos si el usuario esta autentificado
    if (req.session.isAuthenticated) {
        next(); // -> El usuario puede continuar con su petición GET allá donde quería hacerla GET /admin/apartment/new
    } else {
        // en caso contrario lo llevamos a la vista de login
        res.redirect('/login');
    }
});


// Usar la carpeta public para obtener recursos 
app.use(express.static('public'));

app.use(indexRoutes);
app.use("/admin", adminRoutes); // todas las rutas que se encuentran en adminRouter van a ser prefijadas por "/admin"
app.use("/api", cors(), apiRoutes);
app.use(authRoutes);

// Conectarnos al a base de datos
// top-leve await
await connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> {
    console.log(`Escuchando peticiones en el puerto http://localhost:${PORT}`);
})