import jwt from 'jsonwebtoken';

import * as Yup from 'yup';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    // Validate the JSON fields
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // Call the attributes form the request body
    const { email, password } = req.body;

    // Search for users that have a registered email
    const user = await User.findOne({ where: { email } });

    // If there is no valid user
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check the password
    if (!(await user.checkPassword(password))) {
      return res.status(400).json({ error: 'Password does not match' });
    }

    // Call the attributes from the user
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      /*
        Check the password using the JWT token
        Second parameter is a secret word
      */
      token: jwt.sign({ id }, '295ce57763892728eac27bee079b9615', {
        expiresIn: '7d',
      }),
    });
  }
}

export default new SessionController();
