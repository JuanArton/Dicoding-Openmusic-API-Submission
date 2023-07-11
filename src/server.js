require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const song = require('./api/song');
const SongService = require('./services/postgres/SongsService');
const SongValidator = require('./validator/songs');

const album = require('./api/album');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');

const users = require('./api/users');
const UserService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/users');

const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

const authentication = require('./api/authentication');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const AuthenticationValidator = require('./validator/authentication');
const TokenManager = require('./tokenize/TokenManager');

const ActivityService = require('./services/postgres/ActivityService');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationValidator = require('./validator/collaborations');

const upload = require('./api/upload');
const StorageService = require('./services/storage/StorageService');
const UploadValidator = require('./validator/upload');

const _export = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportPlaylistValidator = require('./validator/exports');

const CacheService = require('./services/redis/CacheService');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumService = new AlbumService(new CacheService());
  const userService = new UserService();
  const collaborationService = new CollaborationsService(userService);
  const activityService = new ActivityService();
  const playlistService = new PlaylistService(activityService, collaborationService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/upload/file/images'));

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      Credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: new SongService(),
        validator: SongValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentication,
      options: {
        authenticationService: new AuthenticationService(),
        validator: AuthenticationValidator,
        userService,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _export,
      options: {
        service: ProducerService,
        playlistService,
        validator: ExportPlaylistValidator,
      },
    },
    {
      plugin: upload,
      options: {
        service: storageService,
        albumService,
        validator: UploadValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });

        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });

      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
