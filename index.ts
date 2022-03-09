import 'dotenv/config';
import { TradingBot } from './src/bot'

const testBot = new TradingBot({
    market: {name: 'alpaca'},
    credentials: {
        application: 'alpaca',
        clientId: 'PK2G3155G3JV5YB6FHE7',
        clientSecret: 'DtsnvF2YkxQgXoRbQW96lCekyxjWfaXaSljDcMjN',
    }
});

testBot.enterTrade()
.then(res => console.log(res))
.catch(err => console.log(err));