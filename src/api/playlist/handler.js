class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { name } = request.payload;

    const playlistId = await this._service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });

    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const id = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);

    await this._service.deletePlaylistById(id);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus playlist',
    });

    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const playlistId = request.params;

    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addPlaylistSong(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke playlist',
    });

    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlistId = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const result = await this._service.getPlaylistSong(playlistId);

    const response = h.response({
      status: 'success',
      data: result,
    });

    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { songId } = request.payload;

    const playlistId = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deletePlaylistSong(songId, playlistId.id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus lagu dari playlist',
    });

    return response;
  }

  async getPlaylistActivityHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlistId = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._service.getActivity(playlistId.id);

    const response = h.response({
      status: 'success',
      data: activities,
    });

    return response;
  }
}

module.exports = PlaylistHandler;
