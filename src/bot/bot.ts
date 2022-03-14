import { Market, MarketChartData, MarketDataQuery } from "../markets/market.class";
import { TechnicalAnalysisCalculator } from "../technical-analysis";
import { Watchlist } from "./";

export interface TradingBot {
    tradingBotOptions: TradingBotOptions;
    market: Market;
    watchlist: Watchlist;
    ta: TechnicalAnalysisCalculator;
}
export type ScreenerResult = Stock[]

export interface TradingBotThrottleSettings {}

export interface Stock {
    symbol: string,
    rsi: number,
    movingAverage: number,
    closePrice: number,
    timespan: number,
    passedScreening?: boolean
}


export interface TradingBotOptions {
    market: Market;
    throttleSettings: TradingBotThrottleSettings;
}

export class TradingBot {
    constructor(tradingBotOptions: TradingBotOptions) {
        this.market = tradingBotOptions.market
        this.ta = new TechnicalAnalysisCalculator()
        this.watchlist = new Watchlist({
            market: this.market
        });
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
}