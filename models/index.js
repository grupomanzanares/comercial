
import User     from './User.js'
import Subscriber     from './Subscriber.js'
import Lottery     from './Lottery.js'
import LotteryParticipation     from './LotteryParticipation.js'



// Relaciones
Lottery.hasMany(LotteryParticipation, { foreignKey: 'lotteryId', as: 'participations' });
LotteryParticipation.belongsTo(Lottery, { foreignKey: 'lotteryId', as: 'lottery' });

// Relación con Subscriber
Subscriber.hasMany(LotteryParticipation, { foreignKey: 'subscriberId', as: 'participations' });
LotteryParticipation.belongsTo(Subscriber, { foreignKey: 'subscriberId', as: 'subscriber' });




export{
    User,
    Subscriber,
    Lottery,
    LotteryParticipation
}