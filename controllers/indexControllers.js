import { Apartment } from '../models/Apartment.model.js';

export const getApartments = async (req, res) => {
    // 1. Recuperar los datos del Modelo (Apartment)
    const allApartments = await Apartment.find();
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
    const apartment = await Apartment.findById(req.params.id);

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

    // 🔐 Validar que las fechas tengan lógica antes de guardar
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
    res.send(`
      <h3>✅ Tu reserva ha sido realizada con éxito</h3>
      <a href="/">Volver al HOME</a>
    `);
};

export const searchApartments = async (req, res) => {
    // 1. Obtener la query string del objeto request
    const { maxPrice } = req.query;

    // 2. Filtrar todos los apartamentos de la base de datos por TODOS los criterios de búsqueda que ha informado el usuario
    const filteredApartments = await Apartment.find({ price: { $lte: maxPrice } });

    // 3. PAsar el resultado de la búsqueda a la vista
    res.render('home.ejs', {
        allApartments: filteredApartments,
        filters: {
            maxPrice: maxPrice
        }
    })
}