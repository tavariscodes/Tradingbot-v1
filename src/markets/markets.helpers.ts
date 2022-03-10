import { AlpacaBar } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2"
import { MarketChartData, MarketAccountData } from "./market.class"
import camelCase from 'lodash/camelCase'
import mapKeys from 'lodash/mapKeys';

export const transformAlpacaBar = (data: AlpacaBar): MarketChartData => ({
    symbol: data.Symbol ?? '', 
    openPrice: data.OpenPrice,
    highPrice: data.HighPrice, 
    lowPrice: data.LowPrice,
    closePrice: data.ClosePrice,
    volume: data.Volume,
    timeStamp: data.Timestamp,
    tradeCount: data.TradeCount,
    vwap: data.VWAP
})

export const parseAccountData = (data: any): MarketAccountData => {
    return mapKeys(data, (value, key) => camelCase(key)) as MarketAccountData;
}; 