export const getLoginForm = (req, res) => {
    res.render('login.ejs');
}

export const postLoginForm = (req, res) => {
    // 1. Comprobar si el usuario y contraseña que me han puesto está en la base de datos (spoiler: no hay de base datos, usaremos variables. Pero una autentificación real si deberías permitir que tus usuarios se registren y guardar sus credenciales en una base de datos)
    const { username, password } = req.body;

    // 2a. Si son correctos, modificaremos el objeto req.session para indicar que el usuario esta autentificado.
    // Opción A: Redirgir a la Home page

    if (username == "admin" && password == "admin") {
        req.session.isAuthenticated = true;
        req.session.info = `${username} ha iniciado sesión correctamente.`;
        res.redirect('/');
    } else {
        // 2b. Si no es correcto, pues le enviaremos un error de autorización y le redirigimos de nuevo al formulario de login
        res.redirect('/login');
    }



}

export const Logout = (req, res) => {
    console.log('Logout');

    // TODO: Seria interesante un mensaje típico de "Has cerrado la sesión correctamente"

    req.session.destroy(err => {
        if (err) {
            return res.send('Error al cerrar sesión');
        }
        res.redirect('/');
    });
}