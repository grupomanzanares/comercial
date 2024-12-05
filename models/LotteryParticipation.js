import { DataTypes, Sequelize }  from 'sequelize'      //Cargamas DataTypes de sqquelize para el manejo de tipos
import db from '../config/db.js'           //Traemos la configuracion de la Base de datos
import Lottery from './Lottery.js'           //Traemos la configuracion de la Base de datos


const LotteryParticipation = db.define('LotteryParticipations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {

    timestamps: true,
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

S
export default LotteryParticipation;
