
import { log } from './logger.js';
import puppeteer from 'puppeteer-core';

const BROWSER_STATUS_ACTIVE = 0;
const BROWSER_STATUS_INACTIVE = 1;

class Browser {
    constructor() {
        this.status = BROWSER_STATUS_INACTIVE;
        this.browser = null;
    }
}


async function onDisconnected(browserWrapper, config) {
    browserWrapper.status = BROWSER_STATUS_INACTIVE;
    browserWrapper.browser = null;
    log.error('browser disconnected. restarting...');
    browserWrapper.browser = await _createBrowser(config);
    browserWrapper.browser.on('disconnected', () => {
        onDisconnected(browserWrapper, config);
    });
    browserWrapper.status = BROWSER_STATUS_ACTIVE;
    log.error('browser restarted.');
}

async function createBrowser(config) {
    // create a new browser instance and bind the disconnected hook to restart
    const browser = await _createBrowser(config);
    const browserWrapper = new Browser();
    browserWrapper.browser = browser;
    browserWrapper.status = BROWSER_STATUS_ACTIVE;
    browserWrapper.browser.on('disconnected', () => {
        onDisconnected(browserWrapper, config);
    });
    return browserWrapper;
}


async function _createBrowser(config) {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
        ],
        executablePath: config.chromePath
    });
    return browser;
}

export { createBrowser, BROWSER_STATUS_ACTIVE, BROWSER_STATUS_INACTIVE };