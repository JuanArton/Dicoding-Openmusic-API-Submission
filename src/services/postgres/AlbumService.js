const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({
    name,
    year,
  }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id.id],
    };

    const querySong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs where songs."albumId" = $1',
      values: [id.id],
    };

    const album = await this._pool.query(queryAlbum);
    const songs = await this._pool.query(querySong);

    if (!album.rows[0]) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    let { cover } = album.rows[0];

    if (cover !== null) {
      cover = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${cover}`;
    }

    return {
      album: album.rows[0],
      songs: songs.rows,
      cover,
    };
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id.id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Gagal memperbarui, id album tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WhERE id = $1 RETURNING id',
      values: [id.id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Gagal mengahpus, id album tidak ditemukan');
    }
  }

  async updateAlbumCover(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui sampul. Id album tidak ditemukan');
    }
  }

  async checkAlbumExist(id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async addAlbumLike(albumId, userId) {
    await this.checkAlbumExist(albumId);

    const albumLike = {
      text: 'SELECT * FROM albums_like WHERE album_id = $1 and user_id = $2',
      values: [albumId, userId],
    };

    const likeResult = await this._pool.query(albumLike);

    if (!likeResult.rowCount) {
      const id = `like-${nanoid(16)}`;

      const queryLike = {
        text: 'INSERT INTO albums_like VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      const result = await this._pool.query(queryLike);

      if (!result.rows[0].id) {
        throw new InvariantError('Gagal menykai album');
      }
    } else {
      throw new InvariantError('Album sudah disukai');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM albums_like WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      await this._cacheService.delete(`likes:${albumId}`);
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getAlbumLikes(id) {
    try {
      const result = await this._cacheService.get(`likes:${id}`);

      return ({
        isCache: true,
        likeCount: JSON.parse((result)),
      });
    } catch (error) {
      await this.checkAlbumExist;

      const query = {
        text: 'SELECT COUNT(album_id) FROM albums_like WHERE album_id = $1 GROUP BY album_id',
        values: [id],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`likes:${id}`, JSON.stringify(parseInt(result.rows[0].count, 10)));

      return ({
        isCache: false,
        likeCount: parseInt(result.rows[0].count, 10),
      });
    }
  }
}

module.exports = AlbumService;
