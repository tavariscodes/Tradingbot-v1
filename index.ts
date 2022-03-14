import 'dotenv/config';
import { EventEmitter } from 'events';
import { TradingBot } from './src/bot/bot';
import { AlpacaMarket } from './src/markets'; 
import { Watchlist } from './src/bot';
const testMarket = new AlpacaMarket({
    credentials: {
        application: 'alpaca',
        clientId: process.env.ALPACA_KEY_ID,
        clientSecret:  process.env.ALPACA_SECRET_KEY
    }
});

const testBot = new TradingBot({
    market: testMarket,
    throttleSettings: {  
    }
});

testBot.watchlist.on("stock-added", (data) => {
    console.log("Stock added to WL")
    console.log(data)
})

testBot.watchlist.on("stock-screened", (data) => {
    console.log("Stock screend")
    console.log(data)
})

testBot.watchlist.aggregateWatchlist({
exchange: 'NYSE',
sectors: ['Health Care'],
timespans: [2, 5, 30],
}).then(wl => {
    console.log("All done")
    console.log(wl)
})
.catch(wl => console.log(wl))

// testBot.market.getCalendar({ start: new Date(today.setDate(today.getDate() - 2)), end: today })
// .then(time => {
//     const openTime = new Date(time[0].date);
//     const closeTime = new Date(time[0].date);
//     const [openHours, openMinutes] = time[0].open.split(':').map(stamp => Number(stamp));
//     const [closeHours, closeMinutes] = time[0].close.split(':').map(stamp => Number(stamp));

//     openTime.setHours(openHours, openMinutes)
//     closeTime.setHours(closeHours, closeMinutes)
//     console.log(openTime, closeTime)
// });


// const hi = [2, 5, 30].map((timespan) => {
//     const shit = testMarket.adjustToMarketHours(timespan);
//     return shit
//     // return {
//     //     timespan,
//     //     startTime: startTime < openTime || startTime > closeTime ? openTime : startTime,
//     //     endTime: fifteenMinsAgo > closeTime || fifteenMinsAgo < openTime ? closeTime : endTime
//     // }
// })
// console.log(hi)
// testBot.propogateWatchlist({
//     exchange: 'NYSE',
//     sectors: ['Health Care']
// })
// .then(wl => {
//     console.log("all done")
//     console.log(wl)
// })
// .catch(err => console.log("err"))


// import { downloadExchangeData, getExchangeData } from './src/exchangedata';
// downloadExchangeData('NASDAQ')
// .then(async file => {
//     console.log(await getExchangeData(file));
// })
// .catch(err => console.log(err))


// const today = new Date();
// const fifteenMinsAgo = new Date(today.getTime() - (16 * 60000));
// testMarket.getChartData({
//     symbol: 'AAPL',
//     timeFrame: 'Min', 
//     timeSpan: 5,
//     startTime:  new Date(today.setDate(today.getDate() - 1)),
//     endTime: fifteenMinsAgo
// })
// .then(res => console.log(res))
// .catch(err => console.log(err));

// testMarket.getAccountData()
// .then(accountData => console.log(parseInt(accountData.equity) + 100))
// .catch(err => console.log(err))

// testMarket.getAssets(
//     {
//         status: 'active', 
//         assetClass: 'us_equity',
//         exchange: 'NYSE', 
//         tradable: true
//     }
// )
// .then(assets => console.log(assets))
// .catch(err => console.log(err));