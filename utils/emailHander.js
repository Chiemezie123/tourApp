const nodeMailer = require("nodemailer")
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `nduaguba chiemezie <${process.env.EMAIL_FROM}>`
    }

    newTransport (){
        if(process.env.NODE_ENV === 'production'){
            // sendgrid
            return  nodeMailer.createTransport({
                service:'gmail',
                host:'stmp.gmail.com',
                secure:false,
                auth:{
                    user:'anthonynduaguba123@gmail.com',
                    pass:"jqqo vmau mvgq roin",
                }
            })
        }

        return nodeMailer.createTransport({
            host:'sandbox.smtp.mailtrap.io',
            port:2525,
            auth:{
                user:'d586a3f9ecc028',
                pass:"83e138164373bd",
            }
        })
    }

    async send(template , subject){
        // send the actual email
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        })
        // render the HTML on a pub template
        // define the email options
        const mailOptions = {
            from:this.from,
            to:this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        }

        // create a transport and send email
        const transport = this.newTransport()
        await transport.sendMail(mailOptions)
      }

    async sendWelcome(){
        await this.send('welcome',`welcome to the natours family, dear ${this.firstName}` )
    }

    async sendPassword(){
        await this.send('welcome',`welcome to the natours family, dear ${this.firstName}` )
    }
}


// const sendEmail = async (options)=>{

//     // define transporter
//     const transporter = nodeMailer.createTransport({
//         host:'sandbox.smtp.mailtrap.io',
//         port:2525,
//         auth:{
//             user:'d586a3f9ecc028',
//             pass:"83e138164373bd",
//         }
//     })

//     console.log({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//     });
//     // define the email options
//         const mailOptions = {
//             from: "nduaguba chiemezie <chiemezie@gmail.com>",
//             to:options.email,
//             subject:options.subject,
//             text:options.message
//         }

//         try {
//             const info = await transporter.sendMail(mailOptions);
//             console.log(`Email sent: ${info.response}`);
//         } catch (error) {
//             console.error("Error sending email: ", error);
//         }
//     // actually send the email

//     // await transporter.sendMail(mailOptions)
// };


// module.exports = sendEmail