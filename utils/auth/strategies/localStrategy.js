const { Strategy } = require('passport-local');

const Authservice = require('./../../../service/authService');
const service = new Authservice();

const LocalStrategy = new Strategy(
  {
    usernameField: 'email_usuario',
    passwordField: 'password_usuario',
  },
  async (email_usuario, password_usuario, done) => {
    try {
      const user = await service.getUser(email_usuario, password_usuario);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;
