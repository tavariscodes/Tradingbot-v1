import 'dotenv/config';
import { AlpacaMarket } from './src/markets'; 

const testBot = new AlpacaMarket({
    credentials: {
        application: 'alpaca',
        clientId: process.env.ALPACA_KEY_ID,
        clientSecret:  process.env.ALPACA_SECRET_KEY
    }
});

// testBot.getChartData({
//     symbol: 'HUSA',
//     timeFrame: 'Min', 
//     timeSpan: 10,
//     startTime: new Date(2022, 2, 3, 6),
//     endTime: new Date(2022, 2, 3, 10)
// })
// .then(res => console.log(res))
// .catch(err => console.log(err));

testBot.getAccountData()
.then(accountData => console.log(parseInt(accountData.equity) + 100))
.catch(err => console.log(err))