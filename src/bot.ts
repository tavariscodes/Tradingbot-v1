import { Market } from "./markets/market.class";

export interface TradingBot {
    tradingBotOptions: TradingBotConfig;
    market: Market
}

export interface TradingBotConfig {
    market: Market;
}

export class TradingBot {
    constructor(tradingBotOptions: TradingBotConfig) {
        this.market = tradingBotOptions.market
    }

    async enterTrade() {
        // const accountInfo = await this.market?.getBalance();
        // const shortTermCapital = accountInfo.cash * .30;
        // const longTermCapital = accountInfo.cash * .70; 
        /*
            Price of nickel has more than doubled 
            due to Russian - Ukraninan war
            Mining and Mineral companies have been surging all week long.
            Oil prices go up and 
            Find the stocks that are above 20-day 100-day

            Bot can scrape data from other websites. 
            IF prices go up send notification to person.
        **/
    }

    async propogateWatchlist() {}
}