exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    username: {
      type: 'varchar(30)',
      unique: true,
      notNull: true,
    },
    fullname: {
      type: 'varchar(50)',
      notNull: true,
    },
    password: {
      type: 'text',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
