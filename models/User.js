import { DataTypes}  from 'sequelize'      //Cargamas DataTypes de sqquelize para el manejo de tipos
import db from '../config/db.js'           //Traemos la configuracion de la Base de datos
import bcrypt from 'bcrypt'                //Para encriptar la contraseña 

const User = db.define('users',{
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmed: DataTypes.BOOLEAN
},
{

    hooks: {
        /* Antes de insertar se llama una funcion anonima   async  await   
            recibe el parametro user que es la constante que creamos en el controlador cuando mandamos a guardar   
            const user = await User.create(req.body)   en el controlador con esta instruccion estamos llamando el modelo y antes de guardar se dispara  beforeCreate: async function(user)    
            con brcypt generar un salt y unirlo con el password para que al guardar quede encriptado en la base de datos
        */
        beforeCreate: async function(user){
            const salt    = await bcrypt.genSalt(10)                //Salt: Cadena de caracteres que se adjuntan a la contraseña (es unico)  
            user.password = await bcrypt.hash(user.password, salt)  //Encriptar
        }
    },
        
    //Para consultas
    scopes:{
        deletePassword:{
            attributes:{
                exclude: ['password', 'token', 'createdAt', 'updatedAt', 'confirmed']
            }
        }
    }
}
)



/* Metodo personalizado para cuando el usaurio inicie sesion desencriptemos la contraseña
    y validemos si corresponde a la digitada en el formulario 
    Un prototype
*/
User.prototype.verifyPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}

export default User


/* En Node.js, un prototype es una forma de añadir métodos y propiedades a los objetos de una función constructora. 
Cuando se crea un nuevo objeto utilizando una función constructora, 
este objeto hereda las propiedades y métodos definidos en el prototype de la función constructora.

User es una función constructora que crea nuevos usuarios con un username y una password encriptada. 
El método verifyPassword permite verificar si una contraseña proporcionada coincide con la contraseña encriptada del usuario.
Esta estructura permite reutilizar el método verifyPassword en todas las instancias de User sin tener que redefinirlo en cada instancia, 
haciendo el código más eficiente y organizado. */
