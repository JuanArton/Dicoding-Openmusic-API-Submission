const { mapAlbumToModelWithSong } = require('../../utils/index');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const id = request.params;
    const album = await this._service.getAlbumById(id);

    const mappedAlbum = mapAlbumToModelWithSong(album.album, album.songs, album.cover);

    const response = h.response({
      status: 'success',
      data: {
        album: mappedAlbum,
      },
    });

    return response;
  }

  async updateAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const id = request.params;

    await this._service.updateAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });

    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const id = request.params;
    await this._service.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });

    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._validator.validateAlbumLikePayload({ albumId, userId: credentialId });
    await this._service.addAlbumLike(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus menyukai album',
    });

    return response;
  }

  async getAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;

    const { isCache, likeCount } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: likeCount,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = AlbumHandler;
