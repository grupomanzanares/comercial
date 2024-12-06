import { check, validationResult } from 'express-validator';   
import { Subscriber, Lottery, LotteryParticipation } from '../models/index.js';
import crypto from 'crypto'; // Para generar el código único

/** Función para generar un código único */
const generateUniqueCode = async () => {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = crypto.randomBytes(4).toString('hex').toUpperCase(); // Genera un código aleatorio
        const existingParticipation = await LotteryParticipation.findOne({ where: { code } });
        isUnique = !existingParticipation; // Verifica que no exista en la tabla
    }
    return code;
};



/* Metodos de Visualizacion:  Cuando damos clic para acceder a cada vista   Son llamados de accion para visualizar un formulario 
    Ejempo El incio requiere router.get('/login',     formLogin);  Ruta-Controlador-Vista  ,  
    El controlador renderiza la vista que se encuentra en la cartpeta views  auth logi.pug
*/
const formRegister = async(req, res) =>{
    res.render('subscribe/register',{
        page: 'Registro Cliente',
        csrfToken : req.csrfToken()
    })
}

const formLottery = async (req, res) => {
    try {
        // Buscar el sorteo activo
        const activeLottery = await Lottery.findOne({
            where: { status: true } // Supongamos que el campo "activo" indica el sorteo activo
        });

        let participations = [];
        if (activeLottery) {
            // Buscar las participaciones del sorteo activo
            participations = await LotteryParticipation.findAll({
                where: { lotteryId: activeLottery.id }, 
                attributes: ['subscriberId', 'code'] 
            });
        }

        // Renderizar el formulario con los datos
        res.render('subscribe/lottery', {
            page: 'Sorteo',
            csrfToken: req.csrfToken(),
            activeLottery, // Enviar el sorteo activo
            participations // Enviar las participaciones
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el formulario del sorteo');
    }
};




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
    const { identification, name, phone, email } = req.body;

    /* Paso 2:  Realizar las validaciones con check  de los datos extraidos en el paso 1 del cuerpo de la solicitud  req.body
        await  No puede pasar al paso2  hasta que termine las validaciones*/

    await check('identification')
        .notEmpty().withMessage('El campo identificación es obligatorio')
        .isNumeric().withMessage('La identificación solo debe contener números')
        .isLength({ min: 8, max: 10  }).withMessage('La identificación debe tener al menos 8 caracteres')
        .run(req);
    await check('name').notEmpty().withMessage('El Nombre es Obligatorio').run(req)
    await check('phone')
        .notEmpty().withMessage('Número de celular es obligatorio')
        .isNumeric().withMessage('El número de celular solo debe contener números')
        .isLength({ min: 10, max: 10 }).withMessage('El número de celular debe tener exactamente 10 dígitos')
        .run(req);
    // await check('email').isEmail().withMessage('El No cumple con las características de un correo ').run(req)


    
    let arrayDeErrores = validationResult(req)
    if (!arrayDeErrores.isEmpty()) {
        return res.render('subscribe/register', {
            page: 'Registro Cliente',
            errors: arrayDeErrores.array(),
            csrfToken: req.csrfToken(),
            data: req.body,
        });
    }


    /* Paso 4:  Validaciones con la base de datos:
        Validar si el usuario ya esta suscrito    */  
        
            // if(userExist){
            //     return res.render('subscribe/register',{
            //         page: 'Registro Cliente',
            //         csrfToken : req.csrfToken(),
            //         errors: [{msg: 'Ya te encuentras registrado'}],
            //         data: req.body,
            //         })
            //     }        
   

    try {

        const userExist = await Subscriber.findOne({ where: { identification }})
        let subscriber;
        let code;
        

        if(!userExist){ 
            subscriber = await Subscriber.create({
                identification,
                name,
                phone,
                email,
            });
        }
        else {
            console.log("ya esta creado")
            subscriber = userExist; // Si ya existe, reutilizamos el registro
        }


        const activeLottery = await Lottery.findOne({ where: { status: true } });
        if (!activeLottery) {
            //renderizar agradecimiento
            return res.render('subscribe/register', {
                page: 'Registro Cliente',
                csrfToken: req.csrfToken(),
                errors: [{ msg: 'No hay un sorteo activo en este momento' }],
                data: req.body,
            });
        } else {

            // Validar si ya está registrado en el sorteo
            const alreadyRegistered = await LotteryParticipation.findOne({
                where: {
                    lotteryId: activeLottery.id,
                    subscriberId: subscriber.identification, 
                },
            });

            if (alreadyRegistered) {
                res.render('subscribe/thankYou', {
                    page: 'Ya te encuentras registrado en nuestro Sorteo',
                    subscriber,
                    code: alreadyRegistered.code,
                    lottery: activeLottery.name
                });
            } else {
                /** si aun no esta registrado en el sorteo activo */
                code = await generateUniqueCode();
                await LotteryParticipation.create({
                    lotteryId: activeLottery.id,
                    subscriberId: subscriber.identification,
                    date: new Date(),
                    code,
                });
    
                res.render('subscribe/thankYou', {
                    page: 'Gracias por Participar',
                    subscriber,
                    code,
                    lottery: activeLottery.name
                });
            }
        




        }


    } catch (error) {
        console.error('Error guardando  Subcriptor:', error);
        res.status(500).send('Error guardando  Subcriptor');
    }
};


const winner = async (req, res) => {
    try {
        // Obtener el ID del sorteo desde los parámetros
        const { id } = req.params;

        // Buscar el sorteo activo por ID
        const activeLottery = await Lottery.findOne({
            where: { id }
        });

        if (!activeLottery) {
            return res.status(404).send('Sorteo no encontrado');
        }

        // Obtener las participaciones asociadas al sorteo
        const participants = await LotteryParticipation.findAll({
            where: { lotteryId: id },
            include: [
                {
                    model: Subscriber, // Relación con la tabla de suscriptores
                    as: 'subscriber', // Asegúrate de que el alias coincida con la relación en tu modelo
                    attributes: ['name', 'phone'] // Campos que deseas obtener
                }
            ]
        });

        if (participants.length === 0) {
            return res.status(404).send('No hay participantes en este sorteo');
        }

        // Seleccionar un ganador aleatorio
        const randomIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[randomIndex];

        // Renderizar la vista con los datos del sorteo y el ganador
        res.render('subscribe/winner', {
            page: 'Ganador del Sorteo',
            winner: {
                name: winner.subscriber.name,
                code: winner.code,
                phone: winner.subscriber.phone,
                identification: winner.subscriberId
            },
            lottery: {
                name: activeLottery.name,
                description: activeLottery.description
            }
        });
    } catch (error) {
        console.error('Error en la lógica de sorteo:', error);
        res.status(500).send('Hubo un error al procesar el sorteo');
    }
};


export {
    formRegister,
    register,
    formLottery,
    winner
};
