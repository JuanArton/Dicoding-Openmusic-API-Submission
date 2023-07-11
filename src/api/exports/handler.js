class ExportPlaylistHandler {
  constructor(service, playlistService, validator) {
    this._exportService = service;
    this._playlistService = playlistService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;

    const _playlistId = {
      id: playlistId,
    };

    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(_playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._exportService.sendMessage('export::playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportPlaylistHandler;
