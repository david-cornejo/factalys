const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { config } = require('./../config/config');

const usuarioServicios = require('./usuarioService');
const service = new usuarioServicios();

class Authservice {
  async getUser(email_usuario, password_usuario) {
    const user = await service.buscarEmail(email_usuario);
    if (!user) {
      throw boom.unauthorized();
    }
    const isMach = await bcrypt.compare(
      password_usuario,
      user.password_usuario
    );
    if (!isMach) {
      throw boom.unauthorized();
    }
    delete user.dataValues.password_usuario;
    return user;
  }

  singToken(user) {
    const payload = {
      sub: user.id_usuario,
      role: user.tipo_usuario,
      sucursal: user.id_sucursal,
      clave: user.sucursal.clave,
    };
    const token = jwt.sign(payload, config.jwtSecret);
    return {
      user,
      token,
    };
  }

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.buscarUno(payload.sub);
      if (user.recovery_token !== token) {
        throw boom.notFound();
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await service.actualizar(token, {
        recovery_token: null,
        password_usuario: hash,
      });
      return { message: 'Contraseña cambiada' };
    } catch (error) {
      throw boom.internal();
    }
  }

  async sendRecovery(email_usuario) {
    const user = await service.buscarEmail(email_usuario);
    if (!user) {
      throw boom.notFound();
    }
    const payload = { sub: user.id_usuario };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '15min' });
    const link = `http://localhost:3000/changePassword?token=${token}`;
    await service.actualizar(token, { recovery_token: token });
    const mail = {
      from: `"Soporte de Factalys" <${config.email}>`,
      to: `${user.email_usuario}`,
      subject: 'Email para recuperar contraseña', //${link}
      html: `<div style="font-family: Arial, Helvetica, sans-serif; background-color: white; padding: 20px; border: 1px solid #ccc;">
        <h1 style="background-color: black; padding: 20px; border-radius: 10px; text-align: center; font-weight: bold; font-size: 20px; color: white; margin-bottom: 20px;">
          Recuperación de contraseña
        </h1>
        <p style="font-size: 16px; line-height: 24px; color: #737373; text-align: center; margin-bottom: 20px;">
          Hola, te contactamos desde el soporte técnico de Factalys.
        </p>
        <p style="font-size: 16px; line-height: 24px; color: #737373; text-align: center; margin-bottom: 20px;">
          Recientemente solicitó restablecer su contraseña. Haga clic en el botón a continuación para restablecer de forma segura su contraseña y recuperar el acceso a su cuenta.
        </p>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${link}" target="_blank" style="display: inline-block; padding: 15px 30px; background-color: #22c55e; color: black; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Recuperar contraseña
          </a>
        </div>
        <p style="font-size: 16px; line-height: 24px; color: #737373; text-align: center; margin-bottom: 20px;">
          Si no solicitó un restablecimiento de contraseña, ignore este correo electrónico. Cualquier duda o inquietud no dude en contactarnos
        </p>
        <p style="font-size: 12px; line-height: 16px; color: #737373; text-align: center;">
          © 2025 Factalys. All rights reserved.
        </p>
      </div>`,
    };
    const rta = await this.EnviarEmail(mail);
    return rta;
  }

  async EnviarEmail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: config.hostEmail,
      port: 465,
      secure: true,
      auth: {
        user: config.email,
        pass: config.emailPass,
      },
    });
    await transporter.sendMail(infoMail);
    return { message: 'Correo enviado' };
  }
}

module.exports = Authservice;
