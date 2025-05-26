const nodemailer = require('nodemailer');
const { config } = require('../config/config');

class SupportService {
  async sendSupportEmail({ name, email, message, supportType }) {
    try {
      const recipient = [config.supportEmail1, config.supportEmail2];

      if (!recipient) {
        throw new Error(
          'No se encontró una dirección de correo válida para este tipo de soporte.'
        );
      }

      console.log(`Enviando correo a: ${recipient}`);

      const mail = {
        from: config.email,
        to: recipient, // Verificar que esta variable no esté vacía
        subject: `Solicitud de soporte técnico`,
        html: `<div style="font-family: Arial, Helvetica, sans-serif; background-color: white; padding: 20px; border: 1px solid #ccc;">
          <h1 style="background-color: black; padding: 20px; border-radius: 10px; text-align: center; font-weight: bold; font-size: 20px; color: white; margin-bottom: 20px;">
            Soporte Técnico
          </h1>
          <p style="font-size: 16px; line-height: 24px; color: black; text-align: center; margin-bottom: 20px;">
            Se ha recibido una nueva solicitud de soporte.
          </p>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Correo:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
          <p style="font-size: 12px; line-height: 16px; color: #737373; text-align: center;">
            © 2025 Factalys. Todos los derechos reservados.
          </p>
        </div>`,
      };
      const rta = await this.EnviarEmail(mail);
      return rta;
    } catch (error) {
      console.error('Error en sendSupportEmail:', error.message);
      throw new Error(`Error al enviar el correo de soporte: ${error.message}`);
    }
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

module.exports = SupportService;
