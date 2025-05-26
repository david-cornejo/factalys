const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const Authservice = require('./../service/authService');
const router = express.Router();
const service = new Authservice();

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { token } = service.singToken(user);

      // res.cookie('authToken', token, {
      //   httpOnly: false, // Si quieres que sea accesible desde JS, usa `false`
      //   secure: process.env.COOKIE_SECURE, // Solo en HTTPS en producción
      //   sameSite: 'None', // Protección contra CSRF
      //   domain: process.env.COOKIE_DOMAIN, // Dominio de la cookie
      //   path: '/', // Ruta de la cookie
      // });


      res.cookie('authToken', token, {
        httpOnly: false, // Accesible desde JS
        secure: false, // No requiere HTTPS en local
        sameSite: 'Lax', // Protección básica contra CSRF
        domain: 'localhost', // Dominio para pruebas locales
        path: '/', // Ruta de la cookie
      });

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token, // Devuelve el token en la respuesta JSON
      });
    } catch (error) {
      next(boom.notFound('Correo o contraseña incorrecta'));
    }
  }
);

router.post('/logout', async (req, res, next) => {
  try {
    res.clearCookie('authToken', {
      domain: process.env.COOKIE_DOMAIN, 
      path: '/', 
      secure: process.env.COOKIE_SECURE, 
      sameSite: 'None',
    });

    res.status(200).json({ message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/recovery', async (req, res, next) => {
  try {
    const { email_usuario } = req.body;
    const rta = await service.sendRecovery(email_usuario);
    res.json(rta);
  } catch {
    next(boom.notFound());
  }
});

router.post('/change-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const rta = await service.changePassword(token, newPassword);
    res.json(rta);
  } catch {
    next(console.log('Error'));
  }
});

module.exports = router;
