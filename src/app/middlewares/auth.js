import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  // Call the attribute authorization from headers from request
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  // If the authorizarion attribute does not match with the token provided
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  /*
  Split the authHeader
  Call the second element from the authHeader array
  */
  const [, token] = authHeader.split(' ');

  try {
    /*
    Use the jwt.verify to check the token provided
    using the secret in authConfig
    */
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    // If the token were checked return the user Id
    req.userId = decoded.id;
    // If successful check run next();
    return next();
  } catch (err) {
    // If unsuccessful check return error
    return res.status(401).json({ error: 'Token invalid' });
  }
};
