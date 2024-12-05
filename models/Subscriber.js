
import { DataTypes, Sequelize }  from 'sequelize'      //Cargamas DataTypes de sqquelize para el manejo de tipos
import db from '../config/db.js'           //Traemos la configuracion de la Base de datos

const Subscriber = db.define('subscribers', {
    identification: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
    },
    name: { 
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    phone: { 
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    date: { 
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: true, 
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

export default Subscriber;

