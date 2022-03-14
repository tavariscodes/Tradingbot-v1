import Alpaca from "@alpacahq/alpaca-trade-api";
import { getFriday, snakeToCamelCase, transformAlpacaBar, /* parseAccountData */ } from "./markets.helpers";

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
    timeWindow: number;
    timespan: number;
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
    timespan: number;
    
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

export interface MarketAssetQuery {
    status?: string;
    assetClass?: string;
    exchange?: string;
    symbol?: string;
    tradable?: boolean;
}

export interface MarketAsset {
    id: string;
    class: string;
    exchange: string;
    symbol: string;
    name: string;
    status: string;
    tradable: boolean;
    marginable: boolean;
    shortable: boolean;
    easyToBorrow: boolean;
    fractionable: boolean;
}

export interface MarketCalendarQuery {
    start: Date;
    end: Date;
}

export interface MarketCalendar {
    open: string;
    date: Date;
    close: string;
}

export abstract class Market {
    constructor(app: MarketPlatform, marketConfigOptions: MarketConfig) {
        this.app = app;
    };

    /** Returns user account data */
    abstract getAccountData(): Promise<MarketAccountData>;
    /** Returns chart data for given symbol */
    abstract getChartData(query: MarketDataQuery): Promise<MarketChartData[]>
    /** Returns all tradable assets in a market */
    abstract getAssets(query: MarketAssetQuery): Promise<MarketAsset[]>
    /** Returns calendar open and close times */
    abstract getCalendar(query?: MarketCalendarQuery): Promise<MarketCalendar[]>
    /** Returns adjusted market hours for timespan */
    abstract adjustToMarketHours(timespan: number): {timespan: number, startDate: Date, endDate: Date}
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
        const { 
            symbol, 
            startTime, 
            endTime, 
            timeWindow, 
            timespan, 
            timeFrame 
        } = query;
        const candlesticks: Array<MarketChartData> = [];
        const resp = await this.app.getBarsV2(
            symbol,
            {
                start: startTime.toISOString(), // format: 2022-03-09T21:08:00-05:00
                end: endTime.toISOString(),
                adjustment: 'all',
                timeframe: timeWindow + timeFrame
            }
        )
        for await (let data of resp) {
            candlesticks.push(transformAlpacaBar({...data, timespan, Symbol: symbol}));
        }
        return candlesticks
    }

    async getAccountData(): Promise<MarketAccountData> {
        const accountInformation = await this.app.getAccount();
        return snakeToCamelCase(accountInformation);
    }

    async getAssets(query: MarketAssetQuery): Promise<MarketAsset[]> {
        const { exchange, tradable, status, assetClass } = query;
        const assets = await this.app.getAssets({ status: status ?? null, asset_class: assetClass }) as MarketAsset[];
        return assets
            .map(asset => snakeToCamelCase(asset))
            .filter(assets => assets.exchange === exchange && assets.tradable === tradable)
    }

    async getCalendar(query?: MarketCalendarQuery): Promise<MarketCalendar[]> {
        return query ? await this.app.getCalendar(query) : await this.app.getCalendar()
       
    }

    adjustToMarketHours(timespan: number): {timespan: number, startDate: Date, endDate: Date} {
        const today = new Date();
        const fifteenMinsAgo = 16 * 60000
        const timespanEndDate = new Date((today.getTime() - fifteenMinsAgo));
        const timespanStartDate = new Date(today.setDate(today.getDate() - timespan));
        const timespanStartDateDay = timespanStartDate.getDay();

        const adjustedStartDate = timespanStartDateDay === 0 || timespanStartDateDay === 6 
        ? getFriday(timespanStartDate)
        : timespanStartDate;

        const timespanEndDateDay = timespanEndDate.getDay();
        const adjustedEndDate = timespanEndDateDay === 0 || timespanEndDateDay === 6
        ? getFriday(timespanEndDate)
        : timespanEndDate;

        const marketOpen = new Date(adjustedStartDate.setUTCHours(2, 30));
        const marketClosed = new Date(adjustedStartDate.setHours(9)); 
        let startDate = adjustedStartDate;
        let endDate = adjustedEndDate

        if (adjustedStartDate < marketOpen) {
            startDate = marketOpen;
        } else if (adjustedStartDate > marketClosed) {
            endDate = marketClosed;
        }
        return {
            timespan,
            startDate,
            endDate
        }
    }
}
