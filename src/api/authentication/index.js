const AuthenticationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentication',
  version: '1.0.0',
  register: async (server, {
    authenticationService,
    validator,
    userService,
    tokenManager,
  }) => {
    const authenticationHandler = new AuthenticationHandler(
      authenticationService,
      validator,
      userService,
      tokenManager,
    );

    server.route(routes(authenticationHandler));
  },
};
