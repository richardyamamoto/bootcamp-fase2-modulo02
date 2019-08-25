import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

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

    // Create appointment
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
