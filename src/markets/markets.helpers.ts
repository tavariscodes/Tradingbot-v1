import { AlpacaBar } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2"
import { MarketChartData } from "./market.class"

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