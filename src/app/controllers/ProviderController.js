import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    // Search for only providers users
    const providers = await User.findAll({
      where: { provider: true },
      // Call attributes from the user table
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // Includes attributes from the model File
      include: [
        {
          model: File,
          // Nickname for File
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(providers);
  }
}

export default new ProviderController();
