import Alpaca from "@alpacahq/alpaca-trade-api";
import { parseAccountData, transformAlpacaBar, /* parseAccountData */ } from "./markets.helpers";

export type MarketPlatform = Alpaca  

export interface Market { 
    app: MarketPlatform;
}

export interface MarketConfig {
    credentials: {
        application: string;
        clientId: string;
        clientSecret: string;
    }
}

export interface MarketDataQuery {
    symbol: string;
    startTime: Date;
    endTime: Date;
    timeFrame: "Min" | "Hour" | "Day" | "Month";
    timeSpan: number;
};

export interface MarketChartData {
    symbol: string;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
    volume: number;
    timeStamp: string;
    vwap: number;
    tradeCount: number;
}

export interface MarketAccountData {
    accountNumber?: string;
    status?: string;
    currency?: string;
    buyingPower?: string;
    regtBuyingPower?: string;
    nonMarginableBuyingPower?: string;
    cash?: string;
    accruedFees?: string;
    multiplier?: string;
    pendingTransferIn?: string;
    portfolioValues?: string;
    patternDayTrader?: boolean;
    tradingBlocked?: boolean;
    transfersBlocked?: boolean;
    accountBlocked?: boolean;
    tradeSuspendedByUser?: boolean;
    shortingEnabled?: boolean;
    equity?: string;
    lastEquity?: string;
    longMarketValue?: string;
    shortMarketValue?: string;
    initialMargin?: string;
    maintenanceMargin?: string;
    lastMaintenanceMargin?: string;
    sma?: string;
    daytradeCount?: string;
}

export abstract class Market { 
    constructor(app: MarketPlatform, marketConfigOptions: MarketConfig) {
        this.app = app;
    };

    // abstract getAccountData(): Promise<AccountData>
    /**
     * Returns user account data
     */
    abstract getAccountData(): Promise<MarketAccountData>;
    /**
     * Returns chart data for given symbol
     */
    abstract getChartData(query: MarketDataQuery): Promise<MarketChartData[]>
}

export class AlpacaMarket extends Market {
    constructor(marketConfigOptions: MarketConfig) {
        const app = new Alpaca({
            keyId: marketConfigOptions.credentials.clientId,
            secretKey: marketConfigOptions.credentials.clientSecret,
            paper: true
        });
        super(app, marketConfigOptions);
    }

    async getChartData(query: MarketDataQuery): Promise<MarketChartData[]> {
        const candlestick: Array<MarketChartData> = [];
        const resp = await this.app.getBarsV2(
            query.symbol,
            {
                start: query.startTime.toISOString(),
                end: query.endTime.toISOString(),
                adjustment: 'all',
                timeframe: query.timeSpan + query.timeFrame
            }
        )
        for await (let data of resp) {
            candlestick.push(transformAlpacaBar(data));
        }
        return candlestick
    }

    async getAccountData(): Promise<MarketAccountData> {
        const accountInformation = await this.app.getAccount();
        return parseAccountData(accountInformation);
    }
}
