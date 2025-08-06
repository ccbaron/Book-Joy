import express from 'express';
import { getEditApartment, getNewApartment, postEditApartment, postNewApartment, deleteApartment } from '../controllers/adminControllers.js';

const router = express.Router();

// endpoint AÑADIR APARTAMENTO - FORMULARIO
router.get("/apartment/new", getNewApartment);

// endpoint AÑADIR APARTMENTO - POST - INSERTAR APARTAMENTO EN LA BASE DE DATOS
router.post("/apartment", postNewApartment);


//endpoint FORMULARIO PARA EDITAR APARTAMENTO 
router.get("/apartment/:id/edit", getEditApartment);

//endpoint ACTUALIZAR DATOS DEL APARTAMENTO
router.post("/apartment/:id/edit", postEditApartment);

//endpoint ELIMINAR UN APARTAMENTO
router.post('/apartment/:id/delete', deleteApartment);

export default router;