const Facturapi = require('facturapi');
const { config } = require('../config/config');
const { models } = require('../libs/sequelize');
const nodemailer = require('nodemailer');
const facturapi = new Facturapi(config.facturApi);
class clientesServicios {
  constructor() {
    this.clientes = [];
  }

  async crear(data) {
    const customer = await facturapi.customers.create({
      legal_name: data.nombre_cliente,
      email: data.email_cliente,
      phone: data.telefono_cliente,
      tax_id: data.rfc_cliente,
      tax_system: data.tax_system_cliente,
      address: {
        zip: data.cp_cliente,
      },
    });
    const cliente = await models.Clientes.create({
      nombre_cliente: data.nombre_cliente,
      email_cliente: data.email_cliente,
      rfc_cliente: data.rfc_cliente,
      tax_system_cliente: data.tax_system_cliente,
      telefono_cliente: data.telefono_cliente,
      id_facturapi: customer.id,
    });
    return { customer, cliente };
  }

  async obtenerClientesPorSucursal(id_sucursal) {
    if (id_sucursal == null || id_sucursal == undefined || id_sucursal == '') {
      return [];
    } else {
      try {
        const facturas = await models.Facturacion.findAll({
          where: { id_sucursal },
          include: [
            {
              model: models.Clientes,
              as: 'clientes',
              attributes: [
                'id_cliente',
                'nombre_cliente',
                'email_cliente',
                'rfc_cliente',
              ],
            },
          ],
        });
        const clientes = facturas.map((factura) => factura.clientes);
        const clientesUnicos = Array.from(
          new Map(
            clientes.map((cliente) => [cliente.id_cliente, cliente])
          ).values()
        );
        clientesUnicos.sort((a, b) =>
          a.nombre_cliente.localeCompare(b.nombre_cliente)
        );
        return clientesUnicos;
      } catch (error) {
        throw new Error(
          `Error al obtener clientes por sucursal: ${error.message}`
        );
      }
    }
  }

  async crearClienteDB(data) {
    const cliente = await models.Clientes.create(data);
    return cliente;
  }

  async crearMuchos(data) {
    const nuevosClientes = await Promise.all(
      data.map(async (cliente) => {
        const nuevoCliente = await models.Clientes.create(cliente);
        return nuevoCliente;
      })
    );
    return nuevosClientes;
  }

  async buscar() {
    const rta = await models.Clientes.findAll({
      order: [['nombre_cliente', 'ASC']],
    });
    return rta;
  }

  async buscarFacturas(id) {
    const rta = await models.Clientes.findOne({
      where: {
        id_facturapi: id,
      },
      attributes: ['id_cliente'],
    });
    return rta;
  }

  async buscarUno(id) {
    const clientes = await models.Clientes.findByPk(id);
    if (!clientes) {
      console.log('El cliente no existe');
    }
    return clientes;
  }

  async buscarUnoFacturapi(id) {
    const cliente = await facturapi.customers.retrieve(id);
    return cliente;
  }

  async actualizar(id, cambios) {
    const clientes = await this.buscarUno(id);
    const rta = await clientes.update(cambios);
    return rta;
  }

  async borrar(id) {
    const clientes = await models.Clientes.findByPk(id);
    await clientes.destroy();
    return { id };
  }

  async bucarUnoFacturapi(id) {
    const clienteFacturapi = await facturapi.customers.retrieve(id);
    return clienteFacturapi;
  }

  async actualizarDatosPorFacturapi(idFacturapi, cambios) {
    const cliente = await models.Clientes.findOne({
      where: { id_facturapi: idFacturapi },
    });
    if (!cliente) {
      throw new Error('Cliente no encontrado en la base de datos');
    }

    const updates = {};
    if (cambios.email_cliente) {
      updates.email = cambios.email_cliente;
    }
    if (cambios.telefono_cliente) {
      updates.phone = cambios.telefono_cliente;
    }

    if (Object.keys(updates).length > 0) {
      try {
        await facturapi.customers.update(idFacturapi, updates);
      } catch (error) {
        throw new Error(`Error actualizando en Facturapi: ${error.message}`);
      }
    }

    try {
      const clienteActualizado = await cliente.update(cambios);
      return clienteActualizado;
    } catch (error) {
      throw new Error(
        `Error actualizando en la base de datos: ${error.message}`
      );
    }
  }

  async registrarInteresado(nombre, apellido, correo) {
    const nombreCompleto = `${nombre} ${apellido}`;

    // Correo de bienvenida al cliente
    const correoCliente = {
      from: `"Soporte Factalys" <${config.email}>`,
      to: correo,
      subject: '¡Gracias por tu interés en Factalys!',
      html: `
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background-color: #000000;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        "
      >
        <p style="color: white">Factalys</p>
      </div>
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="text-align: center; color: #22c55e;">¡Hola ${nombre}!</h2>
        <p
          style="
            text-align: center;
            font-weight: 800;
            font-size: 1.25rem;
            line-height: 1.75rem;
          "
        >
          ¡Gracias por escribirnos!
        </p>
        <p style="text-align: center; color: #737373">
          Recibimos tu mensaje y muy pronto te contactaremos para darte todos
          los detalles sobre nuestros servicios.
        </p>
        <p style="text-align: center; color: #737373">
          ¡Estamos emocionados de ayudarte!
        </p>
        <p style="text-align: center; color: #737373">
          Si tienes dudas, escríbenos a
          <a href="soporte@factalys.com" style="color: #22c55e"
            >soporte@factalys.com</a
          >
        </p>
        <p style="text-align: center; color: #737373">Saludos, Factalys</p>
        <p style="text-align: center; color: #737373">© 2025 Factalys.</p>
      </div>
      `,
    };

    // Correo al equipo interno
    const correoInterno = {
      from: `"Soporte Factalys" <${config.email}>`,
      to: 'davidcg914@gmail.com', // Aquí va el correo del área de atención
      subject: '¡Nuevo cliente interesado en Factalys! 🛎️',
      html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e5e5e5;">
    

        <h2 style="text-align: center; color: #2a4d69;">Nuevo interesado registrado</h2>

        <p style="font-size: 16px; color: #333; text-align: center;">
          Un nuevo posible cliente se ha registrado en Factalys. Aquí tienes los datos:
        </p>

        <div style="margin: 25px auto; padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
          <p style="font-size: 15px; color: #333;"><strong>👤 Nombre:</strong> ${nombre} ${apellido}</p>
          <p style="font-size: 15px; color: #333;"><strong>📧 Correo:</strong> <a href="mailto:${correo}" style="color: #22c55e;">${correo}</a></p>
          <p style="font-size: 15px; color: #333;"><strong>🗓️ Fecha de registro:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
          Por favor, realiza el seguimiento correspondiente.
        </p>

        <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">© 2025 Factalys</p>
      </div>
      `,
    };

    await this.EnviarEmail(correoCliente);
    await this.EnviarEmail(correoInterno);

    return { message: 'Registro completado y correos enviados' };
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
module.exports = clientesServicios;
