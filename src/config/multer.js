import multer from 'multer';
// Native module to encrypt
import crypto from 'crypto';
/*
The extname returns the file extension
The resolve allow the route to the directory
*/
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'temp', 'uploads'),
    filename: (req, file, cb) => {
      // Generate a random name
      crypto.randomBytes(16, (err, res) => {
        // In case of error callback the error
        if (err) return cb(err);
        // Callback the res with a hexadecimal name and the file extension
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
