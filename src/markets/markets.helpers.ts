import { AlpacaBar } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2"
import { MarketChartData, MarketAccountData } from "./market.class"
import camelCase from 'lodash/camelCase'
import mapKeys from 'lodash/mapKeys';

interface AlpacaBarExtra extends AlpacaBar {
    timespan: number;
}

export const transformAlpacaBar = (data: AlpacaBarExtra): MarketChartData => ({
    symbol: data.Symbol ?? '',
    openPrice: data.OpenPrice,
    highPrice: data.HighPrice,
    lowPrice: data.LowPrice,
    closePrice: data.ClosePrice,
    volume: data.Volume,
    timeStamp: data.Timestamp,
    tradeCount: data.TradeCount,
    vwap: data.VWAP,
    timespan: data.timespan
})

export const snakeToCamelCase = <T>(data: T): T => {
    return mapKeys(data, (value, key) => camelCase(key)) as T;
};

export const getFriday = (date) => {
    date = new Date(date);
    if (date.getDay() === 5) {
        return (date);
    } else {
        var beforeOneWeek = new Date(date.getTime() - 60 * 60 * 24 * 7 * 1000),
            day = beforeOneWeek.getDay(),
            diffToFriday = day > 5 ? 6 : 5 - day;
        date.setDate((date.getDate() - 7) + diffToFriday);
        return (date);
    }
}