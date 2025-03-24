const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

    //1 Kreiranje na transporter
    const transporter = nodemailer.createTransport({
        host:"sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "aa45da917dbe91",
            pass: "93d4107646aaf8",
        }
    });

    transporter.verify((err, succ)=> {
        if(err){
            console.log(err.message);
        }
        else{
            console.log('success');
        };
    });

    //2 definiranje na opciite na mailot
    const mailOptions = {
        from: "Riste <ristezlatev6@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.messages,
    }

    //3 go isprakjame mailot
    await transporter.sendMail(mailOptions);

};

module.exports = sendEmail;