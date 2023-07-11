const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AuthenticationValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const result = PostAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }

    return result.value;
  },

  validatePutAuthenticationPayload: (payload) => {
    const result = PutAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }

    return result.value;
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const result = DeleteAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }

    return result.value;
  },
};

module.exports = AuthenticationValidator;
