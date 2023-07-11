exports.up = (pgm) => {
  pgm.createTable('albums_like', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: 'users',
      referencesConstraintName: 'fk_albums_like.user_id:users.id',
      notNull: true,
      onDelete: 'CASCADE',
    },
    album_id: {
      type: 'VARCHAR(50)',
      references: 'albums',
      referencesConstraintName: 'fk_albums_like.album_id:albums.id',
      notNull: true,
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums_like');
};
