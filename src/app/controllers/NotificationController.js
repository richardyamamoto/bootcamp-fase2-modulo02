import User from '../models/User';
import Notification from '../schemas/Notifications';

class NotificationController {
  async index(req, res) {
    // Check if logged user is provider
    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Action allowed only for providers' });
    }

    const notification = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notification);
  }

  // Update notification to readed
  async update(req, res) {
    // const notification = await Notification.findById(req.params.id);

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
