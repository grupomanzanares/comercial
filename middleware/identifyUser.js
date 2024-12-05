//Para saber si el usuario esta o no registrado en nuestro sistema  ( estos usuarios para la parte publica con el fin de hacer
// seguimiento a clientes potenciales)

import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

const identifyUser = async (req, res, next)=>{

    //verificar si hay token
    const { _token } = req.cookies
    if(!_token){
        req.user = null
        return next()
    }

    //comprobar el token sea valido
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const user = await User.scope('deletePassword').findByPk(decoded.id)
        if(user){
            req.user = user
            console.log("usuario valido....", req.user)
        }
        return next();
    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }

}

export default identifyUser