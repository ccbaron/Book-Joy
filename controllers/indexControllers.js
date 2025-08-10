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
    // 1) Leemos los filtros desde la query string
    const {
        guests,         // cantidad de personas (capacidad mínima)
        city,           // ciudad
        startDate,      // fecha de entrada deseada
        endDate,        // fecha de salida deseada
        minPrice,       // precio mínimo
        maxPrice,       // precio máximo
        sort            // orden (price_asc, price_desc, m2_asc, m2_desc)
    } = req.query;

    // 2) Construimos la query base para MongoDB
    const q = { isActive: true };

    // 3) Filtros directos que Mongo puede aplicar directamente:

    if (city) q['location.city'] = new RegExp(`^${city}$`, 'i'); // Ciudad (case-insensitive)
    if (guests) q.maxGuests = { $gte: Number(guests) }; // Capacidad mínima (maxGuests >= guests)

    if (minPrice && maxPrice) { // Rango de precio (min/max)
        q.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
        q.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
        q.price = { $lte: Number(maxPrice) };
    }

    // 4) Traemos candidatos desde Mongo
    let results = await Apartment.find(q);

    // 5) Filtro por disponibilidad en fechas (si el usuario las indicó)
    //    Regla: un apartamento está disponible si NO tiene reservas que se SOLAPEN con [startDate, endDate]
    if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);

        results = results.filter(ap => {
            const hasOverlap = ap.reservations?.some(r => {
                const rs = new Date(r.startDate);
                const re = new Date(r.endDate);
                // Solape si: s <= re && e >= rs
                return s <= re && e >= rs;
            });
            return !hasOverlap; // solo dejamos los que NO se solapan
        });
    }

    // 6) Ordenación simple en memoria (por claridad):
    if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    if (sort === 'm2_asc') results.sort((a, b) => a.squareMeters - b.squareMeters);
    if (sort === 'm2_desc') results.sort((a, b) => b.squareMeters - a.squareMeters);

    // 7) Renderizamos la misma home con los resultados + filtros para mantener el estado en el formulario
    res.render('home.ejs', {
        allApartments: results,
        filters: { guests, city, startDate, endDate, minPrice, maxPrice, sort }
    });
};

