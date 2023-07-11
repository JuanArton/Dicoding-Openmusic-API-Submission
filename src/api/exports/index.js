const ExportPlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'export',
  version: '1.0.0',
  register: async (server, { service, playlistService, validator }) => {
    const exportPlaylistHandler = new ExportPlaylistHandler(
      service,
      playlistService,
      validator,
    );

    server.route(routes(exportPlaylistHandler));
  },
};
