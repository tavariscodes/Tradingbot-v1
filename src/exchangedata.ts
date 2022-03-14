import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';
import { max } from 'lodash'
export type StockExchange = 'NYSE' | 'NASDAQ' | 'AMEX'

//  TO-DO: when exhange data is downloaded feed into database

/**
 * returns path containing downloaded exchange data.
 */
export const downloadExchangeData = async (exchange: StockExchange): Promise<string> => {
    // gets stocks from NASDAQ
    try {
        const browser = await puppeteer.launch({
            headless: false
        });
        const downloadPath = path.resolve('./exchangedata');
        const page = await browser.newPage()
        const client = await page.target().createCDPSession();
        await client.send(
            'Page.setDownloadBehavior', 
            {
                behavior: 'allow',
                downloadPath: downloadPath
            }
        );
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        await page.goto(
            `https://www.nasdaq.com/market-activity/stocks/screener?exchange=${exchange}&render=download`,
            {
                waitUntil: 'domcontentloaded'
            }
        );
        await page.waitForSelector(
            'button.ns-download-1', 
            { visible: true }
        );
        await page.evaluate(() => {
            window.scrollBy({
                top: 150
            })
        })
        await page.click('button.nasdaq-screener__form-button--download.ns-download-1');
        await page.waitForTimeout(3000) // wait for file to download
        await browser.close()
        const files = fs.readdirSync(downloadPath);
        return max(files, (f) => {
            // return latest added csv filepath
            const fullPath = path.join(downloadPath, f);
            return fs.statSync(fullPath).ctime;
        });
    } catch (err) {
        throw new Error("Couldn't download exchange data")
    }
}

export const getExchangeData = async (exchange: StockExchange) => {
    try 
    {   
        const fileName = await downloadExchangeData(exchange)
        const csvPath = path.resolve(`./exchangedata/${fileName}`);
        // const csvPath = path.resolve(`./exchangedata/nasdaq_screener_1647082986029.csv`);
        return await csv().fromFile(csvPath);
    } catch (err) {
        console.log(err);
        throw Error("Couldn't get exchange data");
    }
}

