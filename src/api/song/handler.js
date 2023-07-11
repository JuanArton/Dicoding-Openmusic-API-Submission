class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs(title, performer);

    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });
    return response;
  }

  async getSongByIdHandler(request, h) {
    const id = request.params;
    const song = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });
    return response;
  }

  async updateSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const id = request.params;

    await this._service.updateSongById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    });

    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const id = request.params;

    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });

    return response;
  }
}

module.exports = SongHandler;
