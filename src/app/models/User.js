import Sequelize, { Model } from 'sequelize';

import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        // Virtual attribute that exists just for users
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    // Method that runs before save the user in database
    this.addHook('beforeSave', async user => {
      // If user.password were true, encrypt the password with hash
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  // Associate the attribute avatar_id from the file table to the user table
  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  // Compare the password with the generated password hash
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
