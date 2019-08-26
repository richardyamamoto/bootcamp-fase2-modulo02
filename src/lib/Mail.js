import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailConfig;
    // Set the connection with the service
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      // If exists auth.user return auth else return null
      auth: auth.user ? auth : null,
    });
  }

  sendMail(message) {
    this.transporter.sendMail({
      // Use everthing in mailConfig.default
      ...mailConfig.default,
      // Use everthing in message
      ...message,
    });
  }
}

export default new Mail();
