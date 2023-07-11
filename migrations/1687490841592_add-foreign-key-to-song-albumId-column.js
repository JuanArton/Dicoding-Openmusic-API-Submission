exports.up = (pgm) => {
  pgm.sql("INSERT INTO albums VALUES ('old_songs', 'old_songs', 2023)");
  pgm.sql("UPDATE songs SET \"albumId\" = 'old_songs' WHERE \"albumId\" = NULL");
  pgm.addConstraint('songs', 'fk_songs.albumId_albums.id', 'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE SET NULL');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.albumId_albums.id');
  pgm.sql("UPDATE songs SET \"albumId\" = NULL WHERE 'albumId' = 'old_songs'");
  pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
