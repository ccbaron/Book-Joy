import { Apartment } from "../models/Apartment.model.js";

export const getNewApartment = (req, res) => {


    res.render("add-apartment.ejs", {
        apartment: {},
        editMode: false
    });

};

// Crear apartamento (con validaciones y re-render de la vista si hay errores)
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
  
      // 1) Recolectamos errores en un array (para mostrarlos todos a la vez)
      const errors = [];
  
      // 2) Validaciones básicas
      if (!title || !description || !province || !city) {
        errors.push('Debes completar: título, descripción, provincia y ciudad.');
      }
  
      // 3) Validaciones numéricas (> 0). Si un campo viene vacío lo ignoramos.
      const numericFields = { rooms, beds, bathrooms, price, squareMeters, maxGuests };
      for (let [field, value] of Object.entries(numericFields)) {
        if (value !== undefined && value !== '' && (isNaN(value) || Number(value) < 0)) {
          errors.push(`El campo "${field}" debe ser un número positivo.`);
        }
      }
  
      // 4) Validación GPS: si una coordenada existe, la otra también
      if ((gpsLat && !gpsLng) || (!gpsLat && gpsLng)) {
        errors.push('Debes indicar latitud y longitud juntas.');
      }
  
      // 5) Normalizamos fotos (también lo usamos si hay errores)
      const processedPhotos = Object.values(photos || {})
        .filter(p => p.url && p.url.trim() !== '')
        .map(p => ({
          url: p.url.trim(),
          description: p.description?.trim(),
          isMain: p.isMain === 'true' || p.isMain === true
        }));
  
      // 6) Normalizamos servicios a booleanos (también lo usamos si hay errores)
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
  
      // 7) Si hay errores ⇒ re-renderizamos el formulario con los datos introducidos + lista de errores
      if (errors.length > 0) {
        // Construimos un “apartment” provisional con lo que el usuario envió,
        // para que el formulario no se “borre” al mostrar los errores.
        const previewApartment = {
          title,
          description,
          rules,
          rooms: rooms ? Number(rooms) : undefined,
          beds: beds ? Number(beds) : undefined,
          bathrooms: bathrooms ? Number(bathrooms) : undefined,
          price: price ? Number(price) : undefined,
          squareMeters: squareMeters ? Number(squareMeters) : undefined,
          maxGuests: maxGuests ? Number(maxGuests) : undefined,
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
          photos: processedPhotos,
          isActive: req.body.isActive === 'on'
        };
  
        return res.status(400).render('add-apartment.ejs', {
          apartment: previewApartment, // mantenemos lo escrito
          editMode: false,             // seguimos en “crear”
          errors                      // lista de errores para pintar en la vista
        });
      }
  
      // 8) Si todo OK, creamos el documento en la base de datos
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
        photos: processedPhotos,
        isActive: req.body.isActive === 'on' // checkbox
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

// Editar apartamento (con validaciones y re-render de la vista si hay errores)
export const postEditApartment = async (req, res) => {
    const id = req.params.id;
    console.log('Editando apartamento con ID:', id);
  
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
  
      // 1) Recolectamos errores
      const errors = [];
  
      if (!title || !description || !province || !city) {
        errors.push('Debes completar: título, descripción, provincia y ciudad.');
      }
  
      const numericFields = { rooms, beds, bathrooms, price, squareMeters, maxGuests };
      for (let [field, value] of Object.entries(numericFields)) {
        if (value !== undefined && value !== '' && (isNaN(value) || Number(value) < 0)) {
          errors.push(`El campo "${field}" debe ser un número positivo.`);
        }
      }
  
      if ((gpsLat && !gpsLng) || (!gpsLat && gpsLng)) {
        errors.push('Debes indicar latitud y longitud juntas.');
      }
  
      // 2) Normalizamos fotos y servicios (también si hay errores)
      const processedPhotos = Array.isArray(photos)
        ? photos
            .filter(p => p.url && p.url.trim() !== '')
            .map(photo => ({
              url: photo.url.trim(),
              description: photo.description?.trim(),
              isMain: photo.isMain === 'true' || photo.isMain === true
            }))
        : Object.values(photos || {})
            .filter(p => p.url && p.url.trim() !== '')
            .map(p => ({
              url: p.url.trim(),
              description: p.description?.trim(),
              isMain: p.isMain === 'true' || p.isMain === true
            }));
  
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
  
      // 3) Si hay errores ⇒ re-render con datos + errores
      if (errors.length > 0) {
        const previewApartment = {
          _id: id, // necesario para que el action siga apuntando a /:id/edit
          title,
          description,
          rules,
          rooms: rooms ? Number(rooms) : undefined,
          beds: beds ? Number(beds) : undefined,
          bathrooms: bathrooms ? Number(bathrooms) : undefined,
          price: price ? Number(price) : undefined,
          squareMeters: squareMeters ? Number(squareMeters) : undefined,
          maxGuests: maxGuests ? Number(maxGuests) : undefined,
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
          photos: processedPhotos,
          isActive: req.body.isActive === 'on'
        };
  
        return res.status(400).render('add-apartment.ejs', {
          apartment: previewApartment,
          editMode: true,
          errors
        });
      }
  
      // 4) Si todo OK, hacemos update
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
        photos: processedPhotos,
        isActive: req.body.isActive === 'on'
      };
  
      await Apartment.findByIdAndUpdate(id, updatedData);
      res.redirect(`/apartment/${id}`);
    } catch (error) {
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
