// Rutas de acceso libre para cualquier usuairo (home, detalle del apartamento)

import express from 'express';

import { getApartments, getApartmentById, postNewReservation, searchApartments } from '../controllers/indexControllers.js';

const router = express.Router(); // 'router' es un objeto en el cuál vamos a poder definir diferentes  endpoints (para entendernos una especia de app.get, app.post, etc);

// Endpoint para ver todos los apartamentos
// "Cuando me hagas una petición a "/" ejecuta la función getAparments"
router.get("/", getApartments);

// Vista detalle del apartamento
router.get("/apartment/:id", getApartmentById);

// Nueva reserva
router.post("/apartment/reservation/new", postNewReservation);

// Filtrado de apartamentos
router.get("/search", searchApartments);

export default router;