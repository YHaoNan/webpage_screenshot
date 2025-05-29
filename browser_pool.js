/**
 * Browser Pool maintains a pool of browsers.
 */

import puppeteer from 'puppeteer-core';
import pidusage from 'pidusage';

const BROWSER_STATUS_INACTIVE = 'inactive';
const BROWSER_STATUS_ACTIVE = 'active';

class BrowserPool {

    constructor(targetCount) {
        this.targetCount = targetCount;
        this.browsers = [];
        for (let i = 0; i < targetCount; i++) {
            this.browsers.push(new Browser(i));
        }
    }

    async init() {
        for (let browser of this.browsers) {
            await browser.init();
        }
    }

    listBrowsers() {
        return this.browsers;
    }

}

class Browser {

    constructor(identifier) {
        this.identifier = identifier;
        this.puppeteerBrowser = null;
        this.status = BROWSER_STATUS_INACTIVE;
    }

    async init() {
        // todo how to monitor the browser status? how to fault tolerant?
        this.puppeteerBrowser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        });
        this.status = BROWSER_STATUS_ACTIVE;
        this.metrics = new BrowserMetrics(this.puppeteerBrowser);
    }

    async screenshot(task) {
        const page = await this.puppeteerBrowser.newPage();
        if (task.viewport) {
            await page.setViewport(task.viewport);
        }
        if (task.headers) {
            await page.setExtraHTTPHeaders(task.headers);
        }

        await page.goto(task.url);

        const base64Image = await page.screenshot({ encoding: 'base64',  type: task.imageFormat || 'jpeg', quality: task.imageQuality || 80 });

        await page.close();

        return base64Image;
    }
}


class BrowserMetrics {

    constructor(puppeteerBrowser) {
        this.puppeteerBrowser = puppeteerBrowser;
    }

    /**
     * Calculate the metrics of the browser.
     * @returns {Promise<Object>} The metrics of the browser.
     * @property {number} pageCount The number of pages opened in the browser.  
     * @property {number} memUsed The memory used by the browser in bytes.
     * @property {number} cpuLoad The CPU load of the browser.
     * @property {number} pid The PID of the browser.
     */
    async calculateMetrics() {
        console.log('before calculateMetrics');
        const process = this.puppeteerBrowser.process();
        const metrics = await pidusage(process.pid); // this will be slow down the performance
        const pages = await this.puppeteerBrowser.pages();
        console.log('after calculateMetrics');
        return {
            pageCount: pages.length,
            memUsed: metrics.memory,
            cpuLoad: metrics.cpu,
            pid: process.pid
        }
    }

}

export { BrowserPool };

