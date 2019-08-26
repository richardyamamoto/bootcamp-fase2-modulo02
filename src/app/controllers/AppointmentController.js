import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notifications';

class AppointmentController {
  // Create appointments
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

    /*
    Notify appointment to provider
    */

    // Call user using the ID
    const user = await User.findByPk(req.userId);

    // Format date using date-fns
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    // Create notification
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  // List appointments
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

  // Delete appointment by Id
  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);
    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to cancel an appointment" });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'Can only cancel with 2 hours advance' });
    }
    appointment.canceled_at = new Date();

    await appointment.save();
    return res.json(appointment);
  }
}

export default new AppointmentController();
