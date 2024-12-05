import nodemailer from 'nodemailer'



/*
En el controlador al llamar la funcion emailRegister enviamos los datos de nombre, email y token...  
la funcion lo recibe como data
*/

const emailRegister = async (data) => {

        /* Paso 1: Estructura para Conectarnos  a la cuenta de correo */
        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secureConnection: true,
            debug: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        /** Paso 2: Extraemos los datos de data  */
            const {email, name, token} = data



        /** Paso 3: Enviar el email */
            await transport.sendMail({
                from: process.env.EMAIL_USERNAME,
                // from: 'Bienes Raices',
                to: email,
                subject: 'Confirma tu cuenta en Bienes Raices',
                text:'Confirma tu cuenta en Bienes Raices',
                html: `
                    <p>Hola, ${name}, comprueba tu cuenta en Bienes Raices</p>

                    <p>Solo debes confirmar dando click en el siguiente enlace: <a href='${process.env.URL_BACKEND}:${process.env.PORT}/auth/confirm-register/${token}'>Confirmar Cuenta</a></p>

                    <p>Si tu no solicitaste Recuperacion de Password, has caso omiso al mensaje.</p>
                `
            })
}




//Funcion Recuperar Password
const emailRecoverPassword = async (data) => {

       /**  Paso 1 :Estructura para Conectarnos  a la cuenta de correo  */
        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secureConnection: true,
            debug: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

         /** Paso 2: Extraemos los datos de data  */
        const {email, name, token} = data

        /** Paso 3: Enviar el email */
        await transport.sendMail({
            from: process.env.EMAIL_USERNAME,
            //from: 'Bienes Raices',
            to: email,
            subject: 'Reestablece tu Contraseña ',
            text:'Reestablece tu password en Trace Beef',
            html: `
                <p>Hola, ${name}, Has solicitado reestablecer tu contraseña en Trace Beef</p>

                <p>Lo puedes realizar dando click en el siguiente enlace: <a href='${process.env.URL_BACKEND}:${process.env.PORT}/auth/confirm-recover/${token}'>Reestablecer Password </a></p>

                <p>Si tu no creaste esta cuenta, has caso omiso al mensaje.</p>
            `
        })
}


export {
    emailRegister,
    emailRecoverPassword
}