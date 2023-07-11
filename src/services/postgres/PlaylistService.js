const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapPlaylistToModelWithSong } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(activityService, collaborationService) {
    this._pool = new Pool();
    this._activityService = activityService;
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambah playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN collaborations on collaborations.playlist_id = playlists.id INNER JOIN users on users.id = playlists.owner
      WHERE playlists.owner = $1 OR playlists.id = $1 OR collaborations.user_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id.id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist, Id tidak ditemukan');
    }
  }

  async addPlaylistSong(playlistId, songId, userId) {
    const querySong = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rowCount) {
      throw new NotFoundError('Data lagu tidak ditemukan');
    }

    const id = `playlistSong-${nanoid(16)}`;

    const queryPlaylist = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId.id, songId],
    };

    const result = await this._pool.query(queryPlaylist);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist');
    }

    await this._activityService.addActivity(playlistId.id, userId, songId);
  }

  async getPlaylistSong(id) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1`,
      values: [id.id],
    };

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
      JOIN songs on playlist_songs.song_id = songs.id WHERE playlist_id = $1`,
      values: [id.id],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    const resultSong = await this._pool.query(querySong);

    return mapPlaylistToModelWithSong(resultPlaylist.rows[0], resultSong.rows);
  }

  async deletePlaylistSong(songId, playlistId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING song_id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }

    await this._activityService.deleteActivity(playlistId, userId, songId);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT id, owner FROM playlists WHERE id = $1',
      values: [id.id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getActivity(id) {
    const playlist = await this.getPlaylists(id);

    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1 ORDER BY time asc`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return {
      playlistId: playlist[0].id,
      activities: result.rows,
    };
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborations(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
