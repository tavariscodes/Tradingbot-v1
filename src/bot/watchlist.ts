import Bottleneck from "bottleneck";
import { EventEmitter } from "events";
import { getExchangeData, StockExchange } from "../exchangedata";
import { Market, MarketDataQuery } from "../markets";
import { TechnicalAnalysisCalculator } from "../technical-analysis";
import { ScreenerResult, Stock } from "./bot";

export interface WatchlistQuery {
    symbols?: Array<string>;
    sectors?: Array<string>;
    timespans: Array<number>;
    exchange: StockExchange;
}

export interface Watchlist {
    market: Market;
    values: Array<Stock>;
    ta: TechnicalAnalysisCalculator;
    requestThrottleOptions: Bottleneck.ConstructorOptions
}

export interface WatchlistOptions {
    market: Market
}

export class Watchlist extends EventEmitter {
    constructor(watchlistOptions: WatchlistOptions) {
        super()
        this.values = [];
        this.market = watchlistOptions.market;
        this.ta = new TechnicalAnalysisCalculator();
        this.requestThrottleOptions = {
            reservoir: 66,
            reservoirIncreaseAmount: 66,
            reservoirIncreaseInterval: 1000 * 60,
            reservoirIncreaseMaximum: 66,
            minTime: 250,
            maxConcurrent: 5,
            rejectOnDrop: false,
            timeout: 2000,
        }
    }

    private async screener(queries: MarketDataQuery[]): Promise<ScreenerResult> {
        try {
        const screenerResults: ScreenerResult = [];
        const timespanChartData = await Promise.all(queries.map(async query => {
            let data = await this.market.getChartData(query);
            return data;
        }));
        // Screener
        const screenedStocks = await Promise.all(timespanChartData.map(async (chartDataForTimespan, index) => {
            let rsi = await this.ta.getRsi(chartDataForTimespan);
            const movingAverage = await this.ta.getSimpleMovingAverage(chartDataForTimespan);
            let closePrice = chartDataForTimespan[index].closePrice;
            let weightedMovingAverage = 1.15 * movingAverage[0];
            const stock: Stock = {
                symbol: chartDataForTimespan[index].symbol,
                rsi,
                movingAverage,
                closePrice: closePrice,
                timespan: chartDataForTimespan[index].timespan,
                passedScreening: false
            };
            if ((closePrice > weightedMovingAverage) && (rsi >= 40 && rsi <= 60)) {
                stock.passedScreening = true;
            } 
            this.emit('stock-screened', stock)
            return stock
        }));

        const shouldAddStock = screenedStocks.every(stock => stock.passedScreening)
        if (shouldAddStock) {
            this.emit("stock-added", screenedStocks.pop());
            screenerResults.push(screenedStocks.pop())
        }
        this.values.concat(screenerResults as Stock[]);
        return screenerResults
    } 
    catch(err) {
            if (err.message === 'too many requests.') {
                throw new Error(" Error you've reached your request limit Too many requests")
            }
            console.log(err)
            console.log("Error here")
        }
    }

    async aggregateWatchlist(watchlistQuery: WatchlistQuery) {
        return await new Promise(async (resolve) => {
            let tradableAssets = await this.market.getAssets({
                tradable: true,
                assetClass: 'us_equity',
                exchange: watchlistQuery.exchange
            });
            if (watchlistQuery.sectors) {
                const { sectors } = watchlistQuery
                const exchangeData = await getExchangeData(watchlistQuery.exchange);
                const filteredStocks = exchangeData.filter(stock => sectors.includes(stock.Sector));
                tradableAssets = tradableAssets.filter(asset => {
                    for (let x = 0; x < filteredStocks.length; x++) {
                        if (asset.symbol === filteredStocks[x].Symbol) {
                            return asset;
                        }
                    }
                })
            }

            const limiter = new Bottleneck(this.requestThrottleOptions);
            const throttledApiCalls = limiter.wrap((marketQuery: MarketDataQuery[]) => this.screener(marketQuery));
            const tasks = tradableAssets.map(asset => {
                const marketObjs: MarketDataQuery[] = watchlistQuery.timespans.map((timespan) => {
                    const {startDate, endDate} = this.market.adjustToMarketHours(timespan)
                    let timeWindow = 5;
                    let timeFrame = 'Min'
                    if (timespan > 2) {
                        timeWindow = 1;
                        timeFrame = 'Hour'
                    } else if (timespan > 10) {
                        timeWindow = 1;
                        timeFrame = 'Day'
                    }
                    return {
                        timespan,
                        startTime: startDate,
                        endTime: endDate,
                        symbol: asset.symbol,
                        timeFrame: timeFrame,
                        timeWindow: timeWindow
                    } as MarketDataQuery
                });
                return throttledApiCalls(marketObjs)
            });
            let jobCount = 0;
            limiter.on("failed", async (error, jobInfo) => {
                const { id } = jobInfo.options;
                console.warn(`Job ${id} failed: ${error}`);
            });
            limiter.on("done", async () => {
                jobCount++;
                console.log("jobs completed: " + jobCount)
            });
            limiter.on("error", (err) => {
                console.log(err);
            });
            const results = await Promise.allSettled(tasks);
            const successfulResults = results.filter(result => result.status === 'fulfilled').map(result => <PromiseFulfilledResult<ScreenerResult>>result).map(result => result.value).filter(val => val.length > 0);
            resolve(successfulResults)
            return successfulResults;
        })
    }
}