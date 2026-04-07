const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kanth70707@gmail.com',
    pass: 'your_app_password'
  }
});

module.exports = transporter;