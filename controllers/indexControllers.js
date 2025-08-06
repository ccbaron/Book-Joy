import { Apartment } from '../models/Apartment.model.js';

export const getApartments = async (req, res)=> {
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

export const getApartmentById = async (req, res)=> {

    // 1. Recuperar del modelo el documento identificado con el id :id
    const apartment = await Apartment.findById(req.params.id);

    // 2. Crear una vista de nombre apartment-detail.ejs

    // 3. PAsar a esta vista el objeto apartamento
    res.render("apartment-detail.ejs", {
        apartment
    })

}

export const postNewReservation = async (req, res) => {
    // 1. Obtener el email, fecha de inicio de la reserva, y fecha de fin
    const {idApartment, email, startDate, endDate} = req.body;
    
    // 2 Obtener el ID del apartamento a reservar
    const reservedApartment = await Apartment.findById(idApartment);
    
    // 3. Añadir un nuevo objeto al campo apartment.reservations
    reservedApartment.reservations.push({
        email,
        startDate,
        endDate
    });

    // 4. Salvar el documento en la base de datos
    await reservedApartment.save();

    res.send(`Tu reserva ha sido realizada con éxito. Volver a <a href="/">HOME</a>`);
}

export const searchApartments = async (req, res) => {
    // 1. Obtener la query string del objeto request
    const { maxPrice } = req.query;

    // 2. Filtrar todos los apartamentos de la base de datos por TODOS los criterios de búsqueda que ha informado el usuario
    const filteredApartments = await Apartment.find({ price: { $lte: maxPrice }});

    // 3. PAsar el resultado de la búsqueda a la vista
    res.render('home.ejs' , {
        allApartments: filteredApartments,
        filters : {
            maxPrice: maxPrice
        }
    })
}