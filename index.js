import { initConfig } from './config.js';
import { initQueue, STATUS_FAILED, STATUS_SUCCESS } from './task_queue.js';
import puppeteer from 'puppeteer-core';


const config = initConfig();
console.log(config)
const queue = initQueue(config);
const browser = await puppeteer.launch({
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
    ],
    executablePath: config.chromePath
});

while (true) {
    const task = await queue.take();
    if (!task) {
        console.log('no task');
        await wait(1000);
        continue;
    }
    if (!task.id || !task.url) {
        console.log('task has no id or url. ignore.');
        task.reportStatus(STATUS_SUCCESS, null, 'task has no id or url');
        continue;
    }

    console.log(`find task id ${task.id} => ${task}`);

    try {
        const page = await browser.newPage();
        await page.goto(task.url);
        if (task.viewPort) {
            await page.setViewport(task.viewPort);
        }
        if (task.headers) {
            await page.setExtraHTTPHeaders(task.headers);
        }

        // todo task加投递时间，timeout，过期不处理

        const type = task.imageFormat || 'jpeg';
        const quality = task.imageQuality || 60;

        const imageBase64 = await page.screenshot({
            type,
            quality,
            encoding: 'base64'
        });

        console.log(`task ${task.id} done. image size: ${imageBase64.length} bytes`);
        task.reportStatus(STATUS_SUCCESS, imageBase64, null);
    } catch(e) {
        console.error(`task ${task.id} failed. reason: ${e.message}`);
        task.reportStatus(STATUS_FAILED, null, e.message);
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}