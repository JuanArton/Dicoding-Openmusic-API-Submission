const mapAlbumToModelWithSong = ({
  id,
  name,
  year,
}, song, cover) => ({
  id,
  name,
  year,
  coverUrl: cover,
  songs: song,
});

const mapPlaylistToModelWithSong = (playlistData, songsData) => ({
  playlist: {
    id: playlistData.id,
    name: playlistData.name,
    username: playlistData.username,
    songs: songsData,
  },
});

module.exports = {
  mapAlbumToModelWithSong,
  mapPlaylistToModelWithSong,
};
