import { Apartment } from "../models/Apartment.model.js";

export const getNewApartment = (req, res) => {


    res.render("add-apartment.ejs", {
        apartment: {},
        editMode: false
    });

};

export const postNewApartment = async (req, res) => {
    try {
        const {
            title,
            description,
            rules,
            rooms,
            beds,
            bathrooms,
            price,
            squareMeters,
            maxGuests,
            province,
            city,
            gpsLat,
            gpsLng,
            mapLink,
            services,
            photos
        } = req.body;

        // Procesar fotos
        const processedPhotos = Object.values(photos || {})
            .filter(p => p.url && p.url.trim() !== "")
            .map(p => ({
                url: p.url.trim(),
                description: p.description?.trim(),
                isMain: p.isMain === 'true' || p.isMain === true
            }));


        // Procesar servicios con valores booleanos
        const processedServices = {
            wifi: !!services?.wifi,
            parking: !!services?.parking,
            disability: !!services?.disability,
            airConditioning: !!services?.airConditioning,
            heating: !!services?.heating,
            tv: !!services?.tv,
            kitchen: !!services?.kitchen,
            internet: !!services?.internet
        };

        // Crear nuevo apartamento
        const newApartment = new Apartment({
            title,
            description,
            rules,
            rooms: Number(rooms),
            beds: Number(beds),
            bathrooms: Number(bathrooms),
            price: Number(price),
            squareMeters: Number(squareMeters),
            maxGuests: Number(maxGuests),
            location: {
                province,
                city,
                gps: {
                    lat: gpsLat ? Number(gpsLat) : undefined,
                    lng: gpsLng ? Number(gpsLng) : undefined
                },
                mapLink
            },
            services: processedServices,
            photos: processedPhotos
        });

        await newApartment.save();

        req.session.info = 'Apartamento añadido correctamente a la base de datos';
        res.redirect('/');
    } catch (error) {
        console.error('❌ Error al guardar apartamento:', error);
        res.status(500).send('Error al crear apartamento. <a href="/">Volver al HOME</a>');
    }
};

export const getEditApartment = async (req, res) => {
    // 1. Recuperar el documento identificado por su id
    const { id } = req.params;

    // Enviamos un objeto simple (lean) para que EJS no vea $__ u otros metadatos
    const apartment = await Apartment.findById(id).lean();

    // 2. Renderizar la vista add-apartment.ejs y pasar a la misma todos los datos apartamento
    res.render('add-apartment.ejs', {
        apartment,
        editMode: true
    })
}

export const postEditApartment = async (req, res) => {
    // Obtenemos el ID del apartamento desde la URL
    const id = req.params.id;
    console.log("🛠 Editando apartamento con ID:", id);

    try {
        // Extraemos todos los datos enviados desde el formulario
        const {
            title,
            description,
            rules,
            rooms,
            beds,
            bathrooms,
            price,
            squareMeters,
            maxGuests,
            province,
            city,
            gpsLat,
            gpsLng,
            mapLink,
            services,
            photos
        } = req.body;

        // Procesamos el array de fotos que viene del formulario
        const processedPhotos = Array.isArray(photos)
            ? photos.map(photo => ({
                url: photo.url,
                description: photo.description,
                isMain: photo.isMain === 'true' || photo.isMain === true
            }))
            : Object.values(photos || {}).map(p => ({
                url: p.url,
                description: p.description,
                isMain: p.isMain === 'true' || p.isMain === true
            }));

        // Procesamos los servicios para asegurarnos que estén en formato booleano
        // Procesar servicios para que siempre tenga todas las claves
        const processedServices = {
            wifi: !!req.body.services?.wifi,
            parking: !!req.body.services?.parking,
            disability: !!req.body.services?.disability,
            airConditioning: !!req.body.services?.airConditioning,
            heating: !!req.body.services?.heating,
            tv: !!req.body.services?.tv,
            kitchen: !!req.body.services?.kitchen,
            internet: !!req.body.services?.internet
        };


        // Creamos el objeto que contiene todos los cambios a guardar
        const updatedData = {
            title,
            description,
            rules,
            rooms: Number(rooms),
            beds: Number(beds),
            bathrooms: Number(bathrooms),
            price: Number(price),
            squareMeters: Number(squareMeters),
            maxGuests: Number(maxGuests),
            location: {
                province,
                city,
                gps: {
                    lat: gpsLat ? Number(gpsLat) : undefined,
                    lng: gpsLng ? Number(gpsLng) : undefined
                },
                mapLink
            },
            services: processedServices,
            photos: processedPhotos
        };

        // Usamos findByIdAndUpdate para aplicar los cambios en MongoDB
        await Apartment.findByIdAndUpdate(id, updatedData);

        // Redireccionamos al detalle del apartamento actualizado
        res.redirect(`/apartment/${id}`);
    } catch (error) {
        // Si algo falla, mostramos error y log
        console.error('❌ Error al editar apartamento:', error);
        res.status(500).send('Error al editar apartamento. <a href="/">Volver al HOME</a>');
    }
};

// Función para cancelar un apartamento (soft delete)
export const deleteApartment = async (req, res) => {
    try {
        // 1. Obtenemos el ID del apartamento desde los parámetros de la URL
        const { id } = req.params;
        console.log("🗑 Cancelando apartamento (soft delete), ID:", id);

        // 2. Usamos findByIdAndUpdate para cambiar "isActive" a false en lugar de borrarlo
        await Apartment.findByIdAndUpdate(id, { isActive: false });

        // 3. Mensaje opcional en la sesión para mostrar en la vista
        req.session.info = 'Apartamento cancelado (no se mostrará más en la lista)';

        // 4. Redirigimos al home
        res.redirect('/');
    } catch (error) {
        console.error("❌ Error al cancelar apartamento:", error);
        res.status(500).send("Error al cancelar apartamento. <a href='/'>Volver</a>");
    }
};
