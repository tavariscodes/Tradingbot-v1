import Alpaca from "@alpacahq/alpaca-trade-api";
import { AlpacaBar } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2";

export interface TradingBot {
    alpaca: Alpaca | null
}

export interface TradingBotConfig {
    market: {
        name: string;
    };
    credentials: {
        application: string;
        clientId: string;
        clientSecret: string;
    };
    // watchlist?: StockSymbol[];
}

export interface MarketDataQuery {
    symbol: string;
    startTime: Date;
    endTime: Date;
    timeFrame: "Min" | "Hour" | "Day" | "Month";
    timeSpan: number;
}



export class TradingBot {
    constructor(tradingBotOptions: TradingBotConfig) {
        this.alpaca = tradingBotOptions.market.name === 'alpaca' ? 
        new Alpaca({
            keyId: tradingBotOptions.credentials.clientId,
            secretKey: tradingBotOptions.credentials.clientSecret,
            paper: true
        }) : null;
    }

    async getSymbolData(query: MarketDataQuery) {
        if (!this.alpaca) {
            throw new Error('Please initialize class with a supported `Market` type')
        } 
        const candlestick: AlpacaBar[] = [];
        const resp = await this.alpaca.getBarsV2(
            query.symbol,
            {
                start: query.startTime,
                end: query.endTime,
                timeframe: query.timeSpan + query.timeFrame
            }
        )
        for await (let data of resp) {
            candlestick.push(data);
        }
        return candlestick
    }

    async enterTrade() {
        const accountInfo = await this.alpaca?.getAccount();
        const shortTermCapital = accountInfo.cash * .30;
        const longTermCapital = accountInfo.cash * .70; 
        

          
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