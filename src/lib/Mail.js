import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
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
    this.configureTemplates();
  }

  // Set configuration for email templates
  configureTemplates() {
    // Directory for templates
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');
    // Method that nodemailer compile and format templates
    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: exphbs.create({
          // Attach layouts to the path
          layoutsDir: resolve(viewPath, 'layouts'),
          // Attach partials to the path
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          // File extentions
          extname: '.hbs',
        }),
        viewPath,
        // * Capital `N`
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      // Use everthing in mailConfig.default
      ...mailConfig.default,
      // Use everthing in message
      ...message,
    });
  }
}

export default new Mail();
