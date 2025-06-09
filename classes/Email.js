const nodemailer = require('nodemailer');
const {readFile} = require("../helper/file");
const Handlebars = require("handlebars");
const {join} = require("node:path");

// Configure transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send an email
async function sendEmail({email_template, data, to, subject}) {
    email_template = await readFile(`${email_template}.html`);
    const template = Handlebars.compile(email_template);
    const html = template(data);

    if (!Array.isArray(to)) {
        to = [to];
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
    } catch (e) {
        throw new Error(e);
    }
}

async function sendExcelEmail(filePath) {
    // 3. Compose and send email
    const mailOptions = {
        from: '"Panchito Gomez Toros" <pancho@gmail.com>',
        to: 'tamercodellc@gmail.com',
        subject: 'Excel Report',
        text: 'Find attached the latest Excel report.',
        attachments: [
            {
                filename: 'report.xlsx',
                path: filePath,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
    };

    // 4. Send
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.response);
    } catch (err) {
        console.error('❌ Error sending email:', err);
    }
}

module.exports = {sendEmail, sendExcelEmail};