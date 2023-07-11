class UploadHandler {
  constructor(service, albumService, validator) {
    this._service = service;
    this._albumService = albumService;
    this._validator = validator;
  }

  async postAlbumCoverHandler(request, h) {
    const image = request.payload.cover;

    const { id } = request.params;

    await this._validator.validateImageHeaders(image.hapi.headers);

    const filename = await this._service.writeFile(image, image.hapi);

    const album = await this._albumService.getAlbumById({ id });

    if (album.cover !== null) {
      await this._service.deleteFile(album.cover);
    }

    await this._albumService.updateAlbumCover(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    response.code(201);
    return response;
  }
}

module.exports = UploadHandler;
