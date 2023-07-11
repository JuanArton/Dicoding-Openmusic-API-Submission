const ExportPlaylistPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportPlaylistValidator = {
  validateExportPlaylistPayload: (payload) => {
    const result = ExportPlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = ExportPlaylistValidator;
