const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'siditv07@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome, ${name}. Let me kow how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'siditv07@gmail.com',
        subject: `Goodbye ${name}`,
        text: `Goodbye, ${name}. Is there anything we could have done to kept you on board?`
    })

}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}