import File from '../models/File';

class FileController {
  async store(req, res) {
    /*
    Call the attributes from the request file
    Create a nickname for the request file attributes
    */
    const { originalname: name, filename: path } = req.file;

    // Create the file using File model
    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
