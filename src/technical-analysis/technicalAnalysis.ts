import ta from 'ta.js';
import { MarketChartData } from '../markets';

export interface RsiOptions {
    period: number,
}

export class TechnicalAnalysisCalculator {
    async getRsi(chartData: MarketChartData[], options: RsiOptions = { period: 14 }) {
        // does RSI use price? 
        const closePrices = chartData.map(data => (data.closePrice));
        const rsi = await ta.rsi(closePrices, options.period) as number[];
        return rsi[rsi.length - 1];
    }

    async getSimpleMovingAverage(chartData: MarketChartData[]) {
        const closePrices = chartData.map(data => (data.closePrice));
        return await ta.sma(closePrices, closePrices.length);
    }
}