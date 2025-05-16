require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3001,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dBHost: process.env.DB_HOST,
  dBName: process.env.DB_NAME,
  dBPort: process.env.DB_PORT || 15432,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  emailPass: process.env.EMAIL_PASS,
  email: process.env.EMAIL,
  hostEmail: process.env.HOST_EMAIL,
  facturApi: process.env.FACTURE_API,
  supportEmail1: process.env.SUPPORT_EMAIL1,
  supportEmail2: process.env.SUPPORT_EMAIL2,
  supportEmail3: process.env.SUPPORT_EMAIL3,
};

module.exports = { config };
