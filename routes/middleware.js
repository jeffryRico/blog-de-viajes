const express = require('express')
const router = express.Router()
const mysql = require('mysql2')

var pool = mysql.createPool({
    connectionLimit: 30,
    host: 'localhost',
    user: 'root',
    password: '2301561',
    database: 'blog_viajes'
})

router.use('/admin/', (peticion, respuesta, siguiente) => {
    if(!peticion.session.usuario) {
        peticion.flash('mensaje', 'Debe iniciar sesion')
        respuesta.redirect("/inicio")
    }
    else {
        siguiente()
    }
})


module.exports = router