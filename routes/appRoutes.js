import express from 'express'
import {home,  nofFound,  search } from '../controllers/appController.js'
import { formRegister, register, formLottery, winner } from '../controllers/subscriberController.js';


const router = express.Router()


//inicio
router.get('/', home)


// //categorias
// router.get('/categorias/:id', categories)


//404
router.get('/404', nofFound)

//register
router.get('/register', formRegister)
router.post('/register', register)


//Registro
router.get('/register',  formRegister);                         // Vista de registro  
router.post('/register', register);                             // Metodo registrar

//buscador
router.post('/buscador', search)


//Loteria
router.get('/lottery',  formLottery);                         // Vista de registro  
router.post('/lottery/:id', winner);                             // Metodo registrar


export default router;
