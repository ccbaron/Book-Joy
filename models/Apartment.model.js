import mongoose from 'mongoose';

// Obtener solamente aquellas funcionalidad (objetos) que necesites para implementar tu funcionalidad. 
const { Schema, model } = mongoose;

// Schema que va a representar los campos que contiene nuestros apartamentos en la base de datos y sus validaciones
const servicesSchema = new Schema({
    wifi: {
        type: Boolean,
        required: true,
        default: false
    },
    parking: {
        type: Boolean,
        default: false
    },
    disability: {
        type: Boolean,
        required: false
    }
});

// Schema para gestionar las reservas
const reservationSchema = Schema({
    email: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
        // TODO: podéis preguntar a CHAT como realizar una validación para que startDate sea siempre antes que endDate
    }
});


const apartmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 40
    },
    city: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    squareMeters: {
        type: Number,
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    },
    services: {
        type: servicesSchema,
        required: true,
        _id: false
    },
    reservations: [reservationSchema]

    // TODO: Añadid las validaciones que creáis conveniente, PERO NO TODAVÍA. Hasta que no podamos insertar apartamentos en la base de datos. Crear formulariom, conectar con app.post, etc. Validaciones,Complejidad <-------> consigas algo pronto
});

// Asociarlo a un modelo
// Estamos utilizando ESM (Ecmascript Modules)
export const Apartment = model('Apartment', apartmentSchema);
