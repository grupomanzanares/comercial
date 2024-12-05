import { DataTypes}  from 'sequelize'      //Cargamas DataTypes de sqquelize para el manejo de tipos
import db from '../config/db.js'           //Traemos la configuracion de la Base de datos

const Parameter = db.define('parameters',{
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }

}
)

export default Parameter