const { playlistPayloadSchema, playlistSongPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const result = playlistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }

    return result.value;
  },

  validatePlaylistSongPayload: (payload) => {
    const result = playlistSongPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }

    return result.value;
  },
};

module.exports = PlaylistValidator;
