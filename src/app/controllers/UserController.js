import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    // Search a User that matchs the request body email
    const userExists = await User.findOne({ where: { email: req.body.email } });

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });
    // Validate the JSON fields
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Check if the user already exists
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a user based on User model
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  // Method to update user data
  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      // If oldPassword field were filled
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      // Check the equality of fields
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    // Validate the JSON fields
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Call attributes from request body
    const { email, oldPassword } = req.body;

    /*
    Search for the user id with middleware
    The middleware returns the user Id
    */
    const user = await User.findByPk(req.userId);

    // Check if there is another user with the email
    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      // If another user already took the email
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    // If the field oldPassword are true and filled with the right password
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // Call the user attribute and update
    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
