const UploadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'upload',
  version: '1.0.0',
  register: async (server, { service, albumService, validator }) => {
    const uploadsHandler = new UploadHandler(
      service,
      albumService,
      validator,
    );
    server.route(routes(uploadsHandler));
  },
};
