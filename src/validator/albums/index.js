const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, AlbumLikesPayloadSchema } = require('./schema');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const result = AlbumPayloadSchema.validate(payload);
    if (result.error) {
      throw new InvariantError(result.error.message);
    }
    return result.value;
  },

  validateAlbumLikePayload: (payload) => {
    const result = AlbumLikesPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = AlbumValidator;
