import Alpaca from "@alpacahq/alpaca-trade-api";
import { AlpacaBar } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2";

type MarketPlatform = ""

export interface MarketConfig { 
    marketPlatform: MarketPlatform;
}

export interface MarketDataQuery {
    symbol: string;
    startTime: Date;
    endTime: Date;
    timeFrame: "Min" | "Hour" | "Day" | "Month";
    timeSpan: number;
};

export interface Market { 
    client: MarketPlatform;
}


export class Market { 
    constructor(marketConfigOptions: MarketConfig) {
        this.client = marketConfigOptions.marketPlatform;
    }
}