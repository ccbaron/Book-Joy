import { Apartment } from "../models/Apartment.model.js";

export const getApiApartments = async (req, res) => {
    // 1. Recuperar todos los apartmentos de la base de datos
    const allApartments = await Apartment.find();

    // 2. Responder al cliente con todos los apartamentos en formato JSON (NO RENDER)
    res.json(allApartments);
}

export const getFilteredApartments = async (req, res) => {
    // 1. Obtener la query string del objeto request
    let { maxPrice, city } = req.query;

    // Validación de maxPrice
    if (!maxPrice || maxPrice < 1) {
        maxPrice = 999999; // obtener todos los apartamentos
    } else if (isNaN(maxPrice)) {
        return res.status(400).json({error: "maxPrice must be a positive number"});
    }

    // Construir el filtro
    const filter = { price: { $lte: maxPrice } };
    if (city && city.trim() !== "") {
        // Búsqueda insensible a mayúsculas/minúsculas
        filter.city = { $regex: new RegExp(city, "i") };
    }

    // 2. Filtrar todos los apartamentos de la base de datos por los criterios de búsqueda
    const filteredApartments = await Apartment.find(filter);

    // 3. Enviar un JSON con todos los apartamentos que cumplen con los criterios
    res.json(filteredApartments);
}