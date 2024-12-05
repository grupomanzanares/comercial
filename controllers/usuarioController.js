
/**  Importaciones */
import User from "../models/User.js";
import { check, validationResult } from 'express-validator';                  //Para realizar las validaciones
import { generatorJWT,generatorId } from "../helpers/token.js";                            //El helper para generar un token  generatorId 
import { emailRecoverPassword, emailRegister } from '../helpers/emails.js'    //Helper para envio de correo
import Parameter from "../models/Parameter.js";
import bcrypt from 'bcrypt'



/* Metodos de Visualizacion:  Cuando damos clic para acceder a cada vista   Son llamados de accion para visualizar un formulario 
    Ejempo El incio requiere router.get('/login',     formLogin);  Ruta-Controlador-Vista  ,  
    El controlador renderiza la vista que se encuentra en la cartpeta views  auth logi.pug
*/
    const formLogin = (req, res) => {
        res.render('auth/login', {      
            page: 'Inicio de sesion',
            csrfToken : req.csrfToken() 
        });
    }

    const formRegister = (req, res) => {
        res.render('auth/register', {   
            page: 'Crear Cuenta',
            csrfToken : req.csrfToken() 
        });
    }


    const formForgotPassword = (req, res) => {
        res.render('auth/forgot-password', {
            page: '¿Olvidaste tu contraseña? ',
            csrfToken : req.csrfToken() 
        });
    }


    const formprofile = async (req, res) => {
        try {
            // Verificar si req.user está definido (es decir, el usuario está autenticado)
            if (!req.user) {
                // Si no hay usuario autenticado, redirigir al inicio de sesión o manejar la lógica adecuada
                return res.redirect('/auth/login');
            }
    
            // Renderizar el formulario de perfil con los datos del usuario
            res.render('auth/profile', {   
                page: 'Perfil',
                csrfToken: req.csrfToken(),
                user: req.user  // Pasar los datos del usuario al renderizado del formulario
            });
        } catch (error) {
            console.error('Error al cargar el formulario de perfil:', error);
            res.status(500).send('Error interno del servidor');
        }
    }


/* Metodos de accion:  Logica que debe correr para cada proceso :  Es el llamado a la accion
    Por ejemplo cuando estamos en el formulario de registro y presionamos el boton registro, 
    Este es un llamado a la accion desde un formulario: form.space-y-5(method= "post", action="/auth/register")
    busca una ruta POST  y la ruta llama un controlador - el controlador se encarga de comunicarse con el modelo y este 
    ejecuta la accion en la base de datos
    router.post('/register', register); 
    ESTOS METODOS deben ser asyncronos   async await
*/

    const register = async (req, res) => {
        
        /* Paso1:  Extraer los datos del req.body que me entrega la ruta */
            const { name, email, password } = req.body;       

        /* Paso 2:  Realizar las validaciones con check  de los datos extraidos en el paso 1 del cuerpo de la solicitud  req.body 
                    await  No puede pasar al paso2  hasta que termine las validaciones*/
            await check('name').notEmpty().withMessage('El Nombre es Obligatorio').run(req)
            await check('email').isEmail().withMessage('El No cumple con las características de un correo ').run(req)
            await check('password').isLength({min:6}).withMessage('La Contraseña debe ser de minimo 6 caracteres ').run(req)
            await check('repeat_password').equals(password).withMessage('Las contraseñas no son iguales ').run(req)
        
        /* Paso 3:  El resultado de la validacion se almacena en validtionResult
                    por lo que creamos una variable arrayDeErrores let arrayDeErrores = validationResult(req) 
                    Si queremos mostrar en pantalla lo almacenado en result: res.json(arrayDeErrores.array()) 
                    Envio AL FORMULARIO:
                        variable page: para el titulo en la vista
                        Envio el Token
                        Envio el array de errores
                        Envio un array user con los datos extraidos para que si hay error el usuario no los tenga que digitar nuevamente       */
            let arrayDeErrores = validationResult(req) 
            if(!arrayDeErrores.isEmpty()){
                return res.render('auth/register',{
                    page: 'Crear Cuenta',
                    csrfToken : req.csrfToken(),
                    errors:  arrayDeErrores.array(),
                    user: {
                        name:  name,
                        email: email
                    }
                })
            }

        /* Paso 4:  Validaciones con la base de datos:
                    Que no se encuentre el usuario ya registrado en la base de datos con el email que ya extraimos del cuerpo de la peticion req.body    */  
        const userExist = await User.findOne({ where: { email }})
        if(userExist){
            return res.render('auth/register',{
                page: 'Crear Cuenta',
                csrfToken : req.csrfToken(),
                errors: [{msg: 'El correo electronico ya existe'}],
                user: {
                    name: name,
                    email: email
                }
            })
        }        

        let confirmed = 1
        /*Validar el parametro de Si vamoS a confirmar la identidad o No. */
        const validarRegistro = await Parameter.findOne({ where: { id: 1 } });

        if (validarRegistro && validarRegistro.value === '0') {
            confirmed = 0;
        }      


                    
        /* Paso 5:  Guardar en la base de datos
            Es aqui cuando llamamos el modelo para que este se comunique con la base de datos y se guarde el dato
            Creamos una constate y hacemos el INSERT por medio de ORM 
            const user = await User.create(req.body)     asi lo podemos hacer pero necesitamos encriptar password y generar un token
            Generamos un token
        */    
        const user = await User.create({   
            name,
            email,
            password,
            token: generatorId()
        })


        if (confirmed == 1){
        /*Enviar email de confirmación 
                    Enviamos los datos de nombre, email y token...   la funcion lo recibe como data
                    name:  user.name,
                    email: user.email,
                    token: user.token
                    No envio el password.. obviamente por seguridad
                */

                    emailRegister({
                        name:  user.name,
                        email: user.email,
                        token: user.token
                    });
            
            
                    // Paso  Final:   Renderizar Mensaje de envio de correo para confirmar
                    res.render('auth/message', {
                        page: 'Cuenta creada correctamente',
                        mensaje: 'Hemos enviado un correo de confirmación, presiona el enlace para finalizar el proceso',
                        error:false,
                        iniciarSesion:false
                    })
        }else {

            user.confirmed = true
            await user.save()

            // Paso:   Renderizar Mensaje de confirmación
            res.render('auth/message', {
                    page: 'Cuenta creada correctamente',
                    mensaje: 'Ingresa al sistema',
                    error: false,
                    iniciarSesion:true
            })
            
        } 


        // console.log(res.json(user))                         /* Imprimir en Consola los datos de la constate user en formato json */

        
    }


    const registerTokenConfirm = async (req, res, next) =>{
        /** Confirmacion del Registro por medio del token que enviamos al correo */
        /** Esta se ejecuta de un llamado al accion por el link que se envio al correo
         *  En esa ruta viene un token  Cuando es asi  es get  y viene un parametro
         *  Por eso no hablamos del cuerpo de solicitud  req.body  sino del parametro   req.params
         * Next:  llamada a la siguiente operacion en el servidor al final debe indicar next();
         */

        /** Paso 1   Extaemos de los parametros enviados en la ruta el token */
            const { token } = req.params
            //console.log(token)

        
        /** Paso 2  Verificar si el token es valido*/
            const user = await User.findOne({where:{ token }})
            if(!user){ //si no encontro el token
                return res.render('auth/message',{
                    page: 'Error al confirmar la cuenta',
                    mensaje: 'Hubo un error al confirmar tu cuenta, intentalo nuevamente',
                    error: true,
                    iniciarSesion:false
                })
            }
    
        /* Paso 3 Confirmar la cuenta true en la base de datos y quitar el token que se entiende caduco */
        user.token = null
        user.confirmed = true
        await user.save()
    
        /* Paso 4 Renderizar la vista de confirmacion de cuenta  */
        return res.render('auth/message',{
            page: 'Cuenta confirmada',
            mensaje: 'La cuenta ha sido confirmada de forma satisfactoria',
            error: false,
            iniciarSesion: true
        })
        next();
    }

     /* Metodo Recuperacion de Passaword */
    const recoverPassword = async (req, res) => {

        /* Paso1:  Extrer datos del cuerpo de la peticion */
        const { email } = req.body;

        /* Paso2: Validaciones del formulario, 
            y renderizar la vista si el array de errores no esta vacio
        */
        await check('email').isEmail().withMessage('No cumple con las características de un correo ').run(req)
        let arrayDeErrores = validationResult(req)
        if(!arrayDeErrores.isEmpty()){
            return res.render('auth/forgot-password',{
                page: '¿Olvidaste tu contraseña?  Recuperala',
                csrfToken : req.csrfToken(),
                errors:  arrayDeErrores.array()
            })
        }


        /*Paso 3 Validar que exista en la base de datos el email que nos indica el usuario */
        const user = await User.findOne({ where: { email }})
        if(!user){
            return res.render('auth/forgot-password',{
                page: '¿Olvidaste tu contraseña?  Recuperala',
                csrfToken : req.csrfToken(),
                errors: [{msg: 'El correo electrónico No esta registrado'}],
                user: {
                    email: email
                }
            })
        }

        /* Paso 4 Generar Nuevo token- guardarlo en la base de datos 
            la idea es enviar correo y que el usuario valide que realmente esta haciendo la solicitud */
        user.token= generatorId();
        await user.save();
    
        /* Paso 5 Enviar email de confirmación */
        emailRecoverPassword({
            name: user.name,
            email: user.email,
            token: user.token
        });

        /* Paso final de este metodo :  Informar que se envio un correo para recuperacion de password */
        return res.render('auth/message',{
            page: 'Reestablece Password',
            mensaje: 'Hemos enviado un correo con las instrucciones para recuperar password',
            error: false,
            iniciarSesion:false
        })


        //next();
    }


    /*Metodo Confirmacion de token para cambio de contraseña */
    const recoverTokenConfirm  = async(req,res, next) => {

        /** Paso 1   Extaemos de los parametros enviados en la ruta el token */
        const { token } = req.params
        //console.log(token)


        /** Paso 2  Verificar si el token es valido*/
        const user = await User.findOne({where:{ token }})
        if(!user){ //si no encontro el token
            return res.render('auth/message',{
                page: 'Reestablece tu contraseña',
                mensaje: 'Hubo un error al validar tu informacion, intentalo nuevamente',
                error: true,
                iniciarSesion:false
            })
        }
    
        /** Paso 3  Mostrar Formulario para el cambio de contraseña: ENVIAMOS EL Token para en ese formulario 
         *  saber   de que usuario es ese token y modificar
         */
        return res.render('auth/account-recover',{
            page: 'Recuperando password',
            token,
            csrfToken : req.csrfToken() 
        })
        next();
    }


     /*Metodo cambio de contraseña */
    const recover = async(req, res) => {
        /*Es un formulario , nos  envian un req.body  : El cuerpo de la solicitud */
        console.log  (req.body);

        /* Paso 1  Extraer datos:  cuando llamamos el formulario account-recover desde el correo, colocamos en un campo oculto el 
            token, por lo tanto todo lo estamos tomando del cuerpo de la solicitud
        */
        const {  password , token} = req.body;

        /* Paso 2  Validar datos del formulario */
        await check('password').isLength({min:6}).withMessage('La Contraseña debe ser de minimo 6 caracteres ').run(req)
        await check('repeat_password').equals(password).withMessage('Las contraseñas no son iguales ').run(req)    
        let arrayDeErrores = validationResult(req)
        if(!arrayDeErrores.isEmpty()){
            return res.render('auth/account-recover',{
                page: 'Recuperando Password',
                csrfToken : req.csrfToken(),
                errors:  arrayDeErrores.array(),
                })
        }

        /*  Paso 4  Identificar el Usuario  */
        const user = await User.findOne({where:{ token }})
        if(!user){ //si no encontro el token
            res.render('auth/message', {
                page: 'Proceso Fallido o Intento de suplantacion',
                mensaje: '.......Error 404 .........',
                error: true,
                iniciarSesion:false
            })
        }

        /* Paso 5 Hashear o encriptar la nueva contraseña - quitar token y guardar */
        const salt    = await bcrypt.genSalt(10)   
        user.password = await bcrypt.hash(password, salt)
        user.token = null
        user.save();


        /* Paso 6  Informar que el password fue reestablecido  */
        return res.render('auth/message',{
                page: 'Password Reestablecido',
                mensaje: 'Tu nueva contraseña se ha almacenado correctmanete',
                error: false,
                iniciarSesion:true
        })

    }

    /* Metodo Autenticacion */
    const auth = async (req, res) => {

        /* Paso1:  Extrer datos del cuerpo de la peticion */
        const { email, password} = req.body

        /* Paso2:   Realizar las validaciones, renderizar la vista si el array de errores no esta vacio*/
        await check('email').isEmail().withMessage('El correo electronico es obligatorio').run(req)
        await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req)
        let arrayDeErrores = validationResult(req)
        if(!arrayDeErrores.isEmpty()){
            return res.render('auth/login',{
                page: 'Inicio de sesion',
                csrfToken : req.csrfToken(),
                errors:  arrayDeErrores.array()
            })
        }

        /* Paso 3 validar si el usuario existe  */
        const user = await User.findOne({where: {email}})
        if(!user){
            return res.render('auth/login',{
                page: 'Inicio de sesión',
                csrfToken : req.csrfToken(),
                errors: [{msg: 'El Correo y/o contraseña es incorrecto'}]
            })
        }


        /* Paso 4 comprobar si la cuenta ya esta confirmada */
        if(!user.confirmed){
            return res.render('auth/login',{
                page: 'Inicio de sesión',
                csrfToken : req.csrfToken(),
                errors: [{msg: 'La cuenta no está confirmada'}]
            })
        }

        /* Paso 5 comprobar la contraseña llamamos un prototype del modelo User para comparar los password */
        if(!user.verifyPassword(password)){
            return res.render('auth/login',{
                page: 'Inicio de sesión',
                csrfToken : req.csrfToken(),
                errors: [{msg: 'El Correo y/o contraseña es incorrecto'}]
            })
        }

        /* Paso 6:  Al autenticar el usuario: Almacenar el token en una cookie HTTP y dirigir a la pagina que debe visualizar el usuario */ 
        const jwt = generatorJWT({id: user.id, name: user.name, email: user.email})
        //console.log(jwt)
        return res.cookie('_token', jwt,{
            httpOnly: true,             
            // secure: true
        }).redirect('/principal')
    }



    
    const profile = async (req, res) => {

        /* Paso 1 Extraer datos */

        const { name, email,   password } = req.body;

         /* Paso 2  Validar si el usuario existe */
        const user = await User.findOne({where: {email}})
        if(!user){
            return res.render('auth/profile',{
                page: `Editar Perfil: ${req.body.email}`,
                csrfToken : req.csrfToken(),
                errors: [{msg: 'Usuario No existe'}]
            })
        }


        /* Paso 2 Realizar validaciones al formulario */
        await check('name').notEmpty().withMessage('El Nombre es Obligatorio').run(req)
        await check('password').isLength({min:6}).withMessage('La Contraseña debe ser de minimo 6 caracteres ').run(req)
        await check('repeat_password').equals(password).withMessage('Las contraseñas no son iguales ').run(req)

        let result = validationResult(req)
        if(!result.isEmpty()){    //verificar que que no haya errores
            //errores
            return res.render('auth/profile',{
                page: `${req.body.email}`,
                csrfToken : req.csrfToken(),
                errors: result.array(),
                user
            })
        }

        /* Paso 3  Encriptar nueva contraseña */
        const salt = await bcrypt.genSalt(10)
        user.name = name
        user.password = await bcrypt.hash(password, salt)
        user.token = null
        user.save()

        /* Paso 4  Informar del cambio realizado */
        return res.render('auth/message',{
            page: 'Perfil Modificado',
            mensaje: 'Almacenado correctamente',
            error: false,
            iniciarSesion: false
        })
    }

    const logout = async(req, res, next) =>{
        //res.send('saliendo')
        return res.clearCookie('_token').status(200).redirect('/auth/login')
        
    }


export {
    formLogin,
    formRegister,
    formForgotPassword,

    register,
    registerTokenConfirm,
    

    recoverPassword,
    recoverTokenConfirm  ,   //Ruta Confirmacion de token para cambio de contraseña
    recover,                  // Formulario para que el usuario recupere contraseña

    auth,
    logout,

    formprofile,
    profile
}