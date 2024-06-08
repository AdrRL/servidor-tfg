
const nodemailer = require('nodemailer');
const gv = require('./gestorVariables.js')

//const url="https://hall-server-n37fnw7ulq-lm.a.run.app/";
const url="https://servidor-tfg.onrender.com/";
//const url = 'http://localhost:3000';


let transporter;
let options = {
    user: '',
    pass: ''
}

gv.obtenerOptions(function(res)
{
    options = res;
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: options
    });
})

module.exports.conectar=function(callback)
{
    gv.obtenerOptions(function(res){
        options=res;
        callback(res);
    })
} 

module.exports.enviarEmail = async function(direccion, key, men) 
{
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: options
    });

    const html = `
    <head>
        <meta charset="utf-8">
        <title>Confirmación de Cuenta FPA</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #e0f7fa; text-align: center; padding: 20px;">
        <div style="background-color: #ffffff; max-width: 500px; margin: 0 auto; padding: 20px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border: 1px solid #ccc;">
            <h2 style="color: #388e3c;">¡Bienvenido a FPA with OpenAI power!</h2>
            <p>¡Gracias por su solicitud de registro! Para terminar de confirmar su cuenta, por favor, haga click en el enlace de abajo:</p>
            <p style="margin: 20px 0;">
                <a href="${url}confirmarUsuario/${direccion}/${key}" style="text-decoration: none; background-color: #00A67E; color: #ffffff; padding: 10px 30px; border-radius: 5px; font-weight: bold;">Confirmar cuenta</a>
            </p>
            <p style="font-size: 0.8em; color: #777;">Si no solicitaste este registro, puedes ignorar este mensaje.</p>
        </div>
    </body>
    `

    const result = await transporter.sendMail({
        from: 'tic.ramonycajal.adrian@gmail.com',
        to: direccion,
        subject: men,
        text: 'Pulsa aquí para confirmar cuenta',
        html: html,
    });
}
