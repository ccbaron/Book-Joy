import { getApiApartments, getFilteredApartments } from "../controllers/apiControllers.js";
import express from 'express';

const router = express.Router();

// endpoint para obtener todos los apartamentos en formato JSON
router.get('/apartments', getApiApartments);

// Mañana: Obtener los detalles del apartamento
// router.get('/apartments/:id") <-- detalles de un apartmaneto

// Poder buscar por algún parámetro
router.get('/apartments/search', getFilteredApartments); //maxPrice

export default router;