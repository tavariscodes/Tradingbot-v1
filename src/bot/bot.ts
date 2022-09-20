import { Market, MarketChartData, MarketDataQuery } from "../markets/market.class";
import { TechnicalAnalysisCalculator } from "../technical-analysis";
import { Watchlist } from "./";
import { AlpacaMarket } from "../markets";


export interface TradingBot {
    tradingBotOptions: TradingBotOptions;
    watchlist: Watchlist;
    ta: TechnicalAnalysisCalculator;
}
export type ScreenerResult = Stock[]

export interface TradingBotThrottleSettings { }

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

export interface TradingBotCredentials {
    marketName: string;
    clientId: string;
    clientSecret: string;
}

export class TradingBot {
    private static instance: TradingBot;
    private credentials: TradingBotCredentials

    market: Market;

    private constructor() {
        this.ta = new TechnicalAnalysisCalculator()
        this.watchlist = new Watchlist({
            market: this.market
        });
    }

    public static getInstance(): TradingBot {
        if (!TradingBot.instance) {
            TradingBot.instance = new TradingBot()
        }
        return TradingBot.instance;
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

    setMarket(name: string) {
        if (name === 'alpaca') {
            this.market = new AlpacaMarket({
                credentials: {
                    application: name,
                    clientId: this.credentials.clientId,
                    clientSecret: this.credentials.clientSecret,
                }
            })
        }
    }

    setCredentials(credentials: TradingBotCredentials ) {
        this.credentials = credentials;
    }

    hasCredentials(): boolean {
        return this.credentials ? true : false;
    }
}