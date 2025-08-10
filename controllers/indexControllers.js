import { Apartment } from '../models/Apartment.model.js';

export const getApartments = async (req, res) => {
    // 1. Recuperar los datos del Modelo (Apartment)
    const allApartments = await Apartment.find({ isActive: true });
    console.log("🚀 ~ app.get ~ allApartments:", allApartments)

    // TODO: Buscar el precio máximo de todos mis apartamentos en la base de datos. Establecer ese valor en filters.maxPrice

    // 2. Este endpoint va a pasar los datos una vista
    res.render('home.ejs', {
        allApartments,
        filters: {
            maxPrice: ""
        }
    })
};

export const getApartmentById = async (req, res) => {
    const apartment = await Apartment.findOne({
        _id: req.params.id,
        isActive: true
    });

    if (!apartment) {
        return res.status(404).send('Apartamento no encontrado');
    }

    // Convertimos a objeto plano para que EJS no muestre metadatos de Mongoose
    const plainApartment = apartment.toObject();

    res.render("apartment-detail.ejs", {
        apartment: plainApartment
    });
}


export const postNewReservation = async (req, res) => {

    // 1. Recibir datos del formulario
    const { idApartment, email, startDate, endDate } = req.body;

    // 2. Buscar el apartamento por su ID
    const apartment = await Apartment.findById(idApartment);

    if (!apartment) {
        return res.status(404).send("Apartamento no encontrado");
    }

    // Validar que las fechas tengan lógica antes de guardar
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (!startDate || !endDate || newStart >= newEnd) {
        return res.send(`
        <h3>❌ Las fechas seleccionadas no son válidas.</h3>
        <p>Asegúrate de que la fecha de entrada sea anterior a la de salida.</p>
        <a href="/apartment/${idApartment}">Volver al apartamento</a>
    `);
    }

    // 3. Comprobamos si ya hay alguna reserva que se solape con las fechas pedidas
    const isDateTaken = apartment.reservations.some((r) => {
        const existingStart = new Date(r.startDate);
        const existingEnd = new Date(r.endDate);

        return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (isDateTaken) {
        return res.send(`
        <h3>❌ El apartamento ya está reservado en las fechas seleccionadas.</h3>
        <a href="/apartment/${idApartment}">Volver al apartamento</a>
    `);
    }


    if (isDateTaken) {
        return res.send(`
        <h3>❌ El apartamento ya está reservado en las fechas seleccionadas.</h3>
        <a href="/apartment/${idApartment}">Volver al apartamento</a>
      `);
    }

    // 4. Si no hay solapamiento, guardamos la nueva reserva
    apartment.reservations.push({
        email,
        startDate,
        endDate,
    });

    await apartment.save();

    // 5. Confirmación al cliente
    res.render("reservation-success.ejs");

};

// Función para buscar apartamentos según filtros
export const searchApartments = async (req, res) => {
    const { maxPrice, city, maxGuests, startDate, endDate } = req.query;

    const filters = {
        price: { $lte: maxPrice || 10000 }
    };

    if (city) {
        filters["location.city"] = { $regex: new RegExp(city, "i") }; // búsqueda flexible
    }

    if (maxGuests) {
        filters.maxGuests = { $gte: Number(maxGuests) };
    }

    let apartments = await Apartment.find(filters).lean();

    // Filtrar por fechas libres
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        apartments = apartments.filter(ap => {
            const hasConflict = ap.reservations?.some(r => {
                const resStart = new Date(r.startDate);
                const resEnd = new Date(r.endDate);
                return start <= resEnd && end >= resStart;
            });
            return !hasConflict;
        });
    }

    res.render('home.ejs', {
        allApartments: apartments,
        filters: {
            maxPrice,
            city,
            maxGuests,
            startDate,
            endDate
        }
    });
};
