const InvariantError = require('../../exceptions/InvariantError');
const collaborationPayloadSchema = require('./schema');

const CollaborationValidator = {
  validateCollaborationPayload: (payload) => {
    const result = collaborationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }

    return result.value;
  },
};

module.exports = CollaborationValidator;
