class AuthenticationHandler {
  constructor(authenticationService, validator, userService, tokenManager) {
    this._authenticatorService = authenticationService;
    this._validator = validator;
    this._userService = userService;
    this._tokenManager = tokenManager;
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;

    const id = await this._userService.verifyUserCredential(username, password);

    const accessToken = await this._tokenManager.generateAccessToken({ id });
    const refreshToken = await this._tokenManager.generateRefreshToken({ id });

    await this._authenticatorService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticatorService.verifyRefreshToken(refreshToken);

    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
      },
    });

    return response;
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticatorService.verifyRefreshToken(refreshToken);
    await this._authenticatorService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    });

    return response;
  }
}

module.exports = AuthenticationHandler;
