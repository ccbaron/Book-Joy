import { Apartment } from "../models/Apartment.model.js";

export const getNewApartment = (req, res)=> {
    
    
    res.render("add-apartment.ejs", {
        apartment: {},
        editMode: false
    });

};

export const postNewApartment = async (req, res)=> {

    const { title, city, price, size, mainPhoto} = req.body;

    // Validación básica
    if (!title || title.length > 40 || !city) {
        return res.status(400).send('Ups! Validación en el controlador. Algo ha ido mal! Hemos informado a los desarrolladores. <a href="/">Volver al HOME</a>');
    }

    try {
        await Apartment.create({
            title: title,
            city: city,
            price: price,
            squareMeters: size,
            mainPhoto: mainPhoto,
            services: {
                wifi: false,
                parking: false,
                disability: false
            }
        });

        // Actualizamos la variable 'info' de req.session.info para informar al cliente de que se ha añadido el apartamento corectamente
        req.session.info = "Apartamento añadido correctamente a la base de datos";

        // TODO: A lo mejor lo que tendría que pasar aquí realmente es redirigir al usaurio a la vista detalle del apartamento /apartment/{identificadorApartamento}
        res.redirect('/');

    } catch (error) {
        res.send('Ups! Algo ha ido mal! Hemos informado a los desarrolladres. <a href="/">Volver al HOME</a>');
        console.log(error.message);
    }

};

export const getEditApartment = async (req, res) => {
    // 1. Recuperar el documento identificado por su id
    const { id } = req.params;

    const apartment = await Apartment.findById(id);

    // 2. Renderizar la vista add-apartment.ejs y pasar a la misma todos los datos apartamento
    res.render('add-apartment.ejs', {
        apartment,
        editMode: true
    })
}

export const postEditApartment = async (req, res) => {
    // La petición es de tipo POST, todos los datos del formulario deberían estar en req.body
    // El ID del apartamento, lo tenemos en req.params.id
    const id = req.params.id;
    console.log("🚀 ~ postEditApartment ~ id:", id)
    
    // Actualizar el documento de la base de datos dado su id
    await Apartment.findByIdAndUpdate(id, {
        title: req.body.title,
        city: req.body.city,
        price: req.body.price,
        squareMeters: req.body.size,
        mainPhoto: req.body.mainPhoto
    });

    // TODO: Faltaria algún mensaje de confirmacion
    res.redirect(`/apartment/${id}`)
}

export const deleteApartment = async (req, res) => {
    // 1. Obtener el id del apartmento
    const { id } = req.params;
    console.log("🚀 ~ deleteApartment ~ id:", id)

    // 2. Usar el metodo Apart.findByIdAndDelete para eliminar el documento
    await Apartment.findByIdAndDelete(id);

    // 3. Redirigit al usuario a la vista principal
    res.redirect('/');
}