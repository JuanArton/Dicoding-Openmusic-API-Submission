class CollaborationsHandler {
  constructor(collaborationsService, playlistService, validator) {
    this._collaborationService = collaborationsService;
    this._playlistService = playlistService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { playlistId, userId } = request.payload;

    const _playlistId = {
      id: playlistId,
    };

    await this._playlistService.verifyPlaylistOwner(_playlistId, credentialId);

    const collaborationId = await this._collaborationService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const { playlistId, userId } = request.payload;

    const _playlistId = {
      id: playlistId,
    };

    await this._playlistService.verifyPlaylistOwner(_playlistId, credentialId);
    await this._collaborationService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus kolaborasi',
    });

    return response;
  }
}

module.exports = CollaborationsHandler;
