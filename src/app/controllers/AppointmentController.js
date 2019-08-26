import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    // Validate the JSON fields
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // Call the attributes from the request body
    const { provider_id, date } = req.body;

    // Check if provider_id is a provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    // If the user is not a provider
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    /*
      parseISO() - transform json field date in JavaScript date object
      startOfHour - reset the minutes and seconds just working with hours
    */
    const hourStart = startOfHour(parseISO(date));

    // Check if the informed date is before the current date
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not allowed' });
    }
    // Check availability
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(401)
        .json({ error: 'Appointment date is not available' });
    }
    // Create appointment
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    return res.json(appointment);
  }

  async index(req, res) {
    // Use query on URL to paginate the content
    const { page = 1 } = req.query;
    // Search for all appointments created
    const appointments = await Appointment.findAll({
      // Search for the appointments created by the user
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      // Limit the appointments showed
      limit: 20,
      // Show just 20 appointments per page
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }
}

export default new AppointmentController();
