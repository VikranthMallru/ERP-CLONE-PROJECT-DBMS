const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '23cs01028@iitbbs.ac.in',
    pass: 'Saravan@oct2'
  }
});

module.exports = transporter;