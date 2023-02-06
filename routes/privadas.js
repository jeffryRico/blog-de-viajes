const express = require('express')
const router = express.Router()
const mysql = require('mysql2')

var pool = mysql.createPool({
    connectionLimit: 30,
    host: 'localhost',
    user: 'root',
    password: '2301561',
    database:'blog_viajes'
})

router.get('/admin/index', function (peticion, respuesta){
    pool.getConnection(function (err, connection) {
      const consulta =`
      SELECT *
      FROM publicaciones
      WHERE
      autor_id = ${connection.escape(peticion.session.usuario.id)}
      `

      connection.query(consulta, function (error, filas, campos){
        respuesta.render('admin/index', { usuario: peticion.session.usuario, mensaje: peticion.flash('mensaje'), publicaciones: filas })
      })
      connection.release()
    })
  })

  router.get('/procesar_cerrar_sesion', function (peticion, respuesta) {
    peticion.session.destroy();
    respuesta.redirect("/")
  })

  router.get('/admin/agregar', function (peticion, respuesta){
    respuesta.render('admin/agregar',{ mensaje: peticion.flash('mensaje'), usuario: peticion.session.usuario })
  })

  router.post('/admin/procesar_agregar', function (peticion, respuesta){
    pool.getConnection(function (err, connection){
      const date = new Date()
      const fecha = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
      const consulta = `
      INSERT INTO
      publicaciones
      (titulo, resumen, contenido, autor_id, fecha_hora)
      VALUES
      (
        ${connection.escape(peticion.body.titulo)},
        ${connection.escape(peticion.body.resumen)},
        ${connection.escape(peticion.body.contenido)},
        ${connection.escape(peticion.session.usuario.id)},
        ${connection.escape(fecha)}
      )
      `

      connection.query(consulta, function (error, filas, campos){
        peticion.flash('mensaje', 'Publicacion agregada')
        respuesta.redirect("/admin/index")
      })
      connection.release()
    })
  })

  router.get('/admin/editar/:id', (peticion, respuesta) => {
      pool.getConnection((err, connection) => {
          const consulta = `
          SELECT * FROM publicaciones
          WHERE
          id = ${connection.escape(peticion.params.id)}
          AND
          autor_id = ${connection.escape(peticion.session.usuario.id)}
          `
          connection.query(consulta, (error, filas, campos) => {
              if (filas.length > 0){
                  respuesta.render('admin/editar', {publicaciones: filas[0], mensaje: peticion.flash('mensaje'), usuario: peticion.session.usuario})
              }
              else{
                  peticion.flash('mensaje', 'Operacion no permitida')
                  respuesta.redirect("/admin/index")
              }
          })
          connection.release()
      })
  })

  router.post('/admin/procesar_editar', (peticion, respuesta) => {
      pool.getConnection((err, connection) => {
          const consulta = `
          UPDATE publicaciones
          SET
          titulo = ${connection.escape(peticion.body.titulo)},
          resumen = ${connection.escape(peticion.body.resumen)},
          contenido = ${connection.escape(peticion.body.contenido)}
          WHERE
          id = ${connection.escape(peticion.body.id)}
          AND
          autor_id = ${connection.escape(peticion.session.usuario.id)}
          `

          connection.query(consulta, (error, filas, campos) => {
              if (filas && filas.changedRows > 0){
                  peticion.flash('mensaje', 'Publicacion editada')
              }
              else{
                  peticion.flash('mensaje', 'Publicacion no editada')
              }
              respuesta.redirect("/admin/index")
          })
          connection.release()
      })
  })

  router.get('/admin/procesar_eliminar/:id', (peticion, respuesta) => {
      pool.getConnection((err, connection) => {
          const consulta = `
          DELETE
          FROM
          publicaciones
          WHERE
          id = ${connection.escape(peticion.params.id)}
          AND
          autor_id = ${connection.escape(peticion.session.usuario.id)}
          `

          connection.query(consulta, (error, filas, campos) => {
              if (filas && filas.affectedRows > 0){
                  peticion.flash('mensaje', 'Publicacion eliminada')
              }
              else{
                  peticion.flash('mensaje', 'Publicacion no eliminada')
              }
              respuesta.redirect("/admin/index")
          })
          connection.release()
      })
  })

  module.exports = router