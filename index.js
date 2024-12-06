// 1.  Cargamos express     mediante //ECMA-Script Modules, En package.json y agregar   "type": "module",
import express from 'express';  
import usuarioRoutes from './routes/usuarioRoutes.js';
import appRoutes     from './routes/appRoutes.js';
import principalRoutes     from './routes/principalRoutes.js';
import db from './config/db.js';
import Parameter from './models/Parameter.js'; // Importa el modelo de Parameter 

/* Seguridad */
import cookieParser from 'cookie-parser';
import csurf from 'csurf';  


// 2. crear la app
const app = express();

            /**
             * CONFIGURACIONES
             * Definir carpeta pública
             * 
             * 
             *  */
                //app.use(express.static ('public'))  
                app.use('/market', express.static('public'));
                
                

            /** CONEXION A LA BASE DE DATOS */
            try {
                await db.authenticate();
                console.info('Conexión exitosa a la base de datos');
                await db.sync();                                        /*   Sincroniza cambios en la Base de Datos */
                console.info('Sincronización completada');
            } catch (error) {
                console.log(error);
            }

            /** HABILITAR LECTURA DE DATOS DEL FORMULARIO
             * Permite que Express entienda y acceda a los datos de un formulario,
             * Así, en la ruta que maneja la solicitud POST, podra acceder a los datos del req.body el cuerpo de la solicitud
             */
            app.use(express.urlencoded({extended:true}))


            //Habilitar Cookie Parser:  permite guardar el jwt que creemos
            app.use(cookieParser());   


            // Habilitar el CSRF
            app.use(csurf({cookie:true}));   


// 4. Definir las rutas
app.use('/market/auth', usuarioRoutes)
app.use('/market', appRoutes)
app.use('/market', principalRoutes)

app.get('/market/test', (req, res) => {
    res.send('Ruta /market/test funcionando');
});


// 5.  Habilitar plantilla Pub:  configuramos
app.set('view engine', 'pug') //voy a utilizar un motor de plantillas llamado pug
app.set('views','./views')  // ruta donde estaran las vistas






// 3. Definir un Puerto y arrancar el proyecto
const port = process.env.PORT || 3001;
app.listen(port,'0.0.0.0', ()=>{
    console.log(`Escuchando en el puerto ${port}`)
});