const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const queryUser = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const resultUser = await this._pool.query(queryUser);

    if (!resultUser.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const queryCollab = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(queryCollab);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan kolaborasi');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus kolaborasi');
    }
  }

  async verifyCollaborations(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId.id, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaborations tidak valid');
    }
  }
}

module.exports = CollaborationsService;
