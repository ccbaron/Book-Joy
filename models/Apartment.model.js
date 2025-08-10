import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Schema para todos los servicios que se ofrecen el apartamento
const servicesSchema = new Schema({
    wifi:           { type: Boolean, default: false },
    parking:        { type: Boolean, default: false },
    disability:     { type: Boolean, default: false },
    airConditioning:{ type: Boolean, default: false },
    heating:        { type: Boolean, default: false },
    tv:             { type: Boolean, default: false },
    kitchen:        { type: Boolean, default: false },
    internet:       { type: Boolean, default: false },
  }, { _id: false }); // Para evitar crear un _id adicional por servicio

// Schema para fotos adicionales del apartamento
const photoSchema = new Schema({
    url: { type: String, required: true },
    description: { type: String },
    isMain: { type: Boolean, default: false }
}, { _id: false });

// Schema para reservas del apartamento
const reservationSchema = new Schema({
    email: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return this.startDate < value;
            },
            message: 'La fecha de fin debe ser posterior a la fecha de inicio.'
        }
    }
}, { _id: false });

// Schema principal del apartamento
const apartmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 40
    },

    description: {
        type: String
    },

    rules: {
        type: String
    },

    rooms: {
        type: Number,
        min: 0
    },

    beds: {
        type: Number,
        min: 0
    },

    bathrooms: {
        type: Number,
        min: 0
    },

    // Fotos del apartamento (máx. 4), incluyendo la principal marcada con `isMain`
    photos: {
        type: [photoSchema],
        validate: {
            validator: function (value) {
                return value.length <= 4;
            },
            message: 'No puedes añadir más de 4 fotos.'
        }
    },

    price: {
        type: Number,
        required: true
    },

    squareMeters: {
        type: Number,
        required: true
    },

    maxGuests: {
        type: Number
    },

    services: {
        type: servicesSchema,
        required: true,
        default: {}, // si no llegan, quedan en false
    },

    // Ubicación detallada del apartamento
    location: {
        province: { type: String },
        city: { type: String, required: true },
        gps: {
            lat: { type: Number },
            lng: { type: Number }
        },
        mapLink: { type: String }
    },

    // Reservas activas de este apartamento
    reservations: [reservationSchema],

    // Campo para "eliminar" sin borrar
    isActive: {
        type: Boolean,
        default: true
    }
});

// Crear y exportar el modelo
export const Apartment = model('Apartment', apartmentSchema);
