
import express from 'express';  
import { auth, formForgotPassword, formLogin, formRegister, formprofile, logout, profile, recover, recoverPassword, recoverTokenConfirm, register, registerTokenConfirm } from '../controllers/usuarioController.js';
import identifyUser from '../middleware/identifyUser.js';

const router = express.Router();

//Autenticacion
router.get('/login',     formLogin);
router.post('/login',    auth);

//Administrar Perfil

router.get('/profile', identifyUser, formprofile);
router.post('/profile',     profile);



//Registro
router.get('/register',  formRegister);                         // Vista de registro  
router.post('/register', register);                             // Metodo registrar 
router.get('/confirm-register/:token',registerTokenConfirm)     //Ruta validacion token para confirmacion de correo en registro


//Ruta Recuperacion de acceso
router.get('/forgot',    formForgotPassword);       //el acceso a la vista de olvide password
router.post('/recover-password', recoverPassword);  //el acceso al metodo de recuperacion de password
router.get('/confirm-recover/:token',recoverTokenConfirm);     //Ruta Confirmacion de token para cambio de contraseña
router.post('/recover', recover);  //Nuevo Password


//Cerrar sesion
router.post('/logout', logout)



export default router;   //Exporta un elemento