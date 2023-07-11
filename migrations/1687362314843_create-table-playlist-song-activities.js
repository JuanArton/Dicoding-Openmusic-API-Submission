exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'varchar(50)',
      references: '"playlists"',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
    song_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    user_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    action: {
      type: 'text',
      notNull: true,
    },
    time: {
      type: 'text',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};
