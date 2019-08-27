import { format } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  // Easy way to get the attribute withou constructor
  get key() {
    return 'CancellationMail';
  }

  // Execute when process were executed
  async handle({ data }) {
    const { appointment } = data;
    // Send mail
    Mail.sendMail({
      // Default format for recipient
      // name <email>
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      // Email template
      template: 'cancellation',
      // Binds that template is waiting
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancellationMail();
