
import { initConfig } from './config.js';
import { initQueue, STATUS_FAILED, STATUS_SUCCESS } from './task_queue.js';
import { AtomicInt } from './atomic.js';
import { log } from './logger.js';
import { createBrowser, BROWSER_STATUS_ACTIVE } from './browser.js';


log.info(`Start to initialize config...`)
const config = await initConfig();
log.info(`done ${JSON.stringify(config)}`);

log.info(`Start to initialize task queue...`)
const queue = initQueue(config);
log.info(`Done.`)

log.info(`Creating browser instance...`)
const browser = await createBrowser(config);
log.info(`Done.`)

if (config.warmupUrlList) {
    log.info(`Found ${config.warmupUrlList.length} target in warmup url list. Warmup browser...`);
    for (const warmupEntry of config.warmupUrlList) {
        if (warmupEntry && warmupEntry.url) { 
            log.info(`Warmup: ${warmupEntry.url} with delay ${warmupEntry.delay || 2000}ms...`);
            await browser.browser.newPage().then(async (page) => {
                await page.goto(warmupEntry.url);
                await wait(warmupEntry.delay || 2000);
                await page.close();
                log.info(`Warmup Done: ${warmupEntry.url}.`);
            });
        }
    }
}

const inflightScreenShotTask = new AtomicInt(0);

log.info(`Entering mainloop...`)

while (true) {
    if (browser.status !== BROWSER_STATUS_ACTIVE) {
        log.error('mainloop: browser disconnected. waiting for restart...');
        await wait(1000);
        continue;
    }
    
    // Limit the max inflight screen shot task count
    const inflightTaskCount = await inflightScreenShotTask.getAndIncrement();
    log.debug(`inflightTaskCount: ${inflightTaskCount}`);
    if (inflightTaskCount >= config.maxConcurrentInflightTask) {
        await inflightScreenShotTask.getAndIncrement(-1);
        log.info(`Inflight task count reached max concurrent inflight task limit ${config.maxConcurrentInflightTask}. Waiting for 1000ms...`);
        await wait(1000);
        continue;
    }
    

    // We have safe screen shot task count if we reached here.
    // So we can take one task from the queue.
    const task = await queue.take();
    if (!task) {
        await inflightScreenShotTask.getAndIncrement(-1);
        log.debug('no task');
        await wait(1000);
        continue;
    }

    if (!task.id || !task.url) {
        await inflightScreenShotTask.getAndIncrement(-1);
        log.warn('task has no id or url. ignore.');
        task.reportStatus(STATUS_SUCCESS, null, 'task has no id or url');
        continue;
    }

    log.debug(`find task id ${task.id} => ${JSON.stringify(task)}`);

    
    try {
        log.debug(`Task ${task.id} new page creating...`);
        browser.browser.newPage().then(async (page) => {  // newPage是一个异步操作，不会阻塞主事件循环

            log.debug(`Task ${task.id} got a new page`);
            // todo timeoutAt检查
            // todo resubmit检查

            try {
                log.debug(`Task ${task.id} goto ${task.url}...`);
                await page.goto(task.url);
                if (task.viewPort) {
                    await page.setViewport(task.viewPort);
                }
                if (task.headers) {
                    await page.setExtraHTTPHeaders(task.headers);
                }

                const type = task.imageFormat || 'jpeg';
                const quality = task.imageQuality || 60;


                if (task.delay) {
                    log.debug(`Task ${task.id} delay ${task.delay}ms before take screenshot...`);
                    await wait(task.delay);
                }

                log.debug(`Task ${task.id} screenshot...`);

                const imageBase64 = await page.screenshot({
                    type,
                    quality,
                    encoding: 'base64',
                    fullScreen: true
                });
                log.debug(`Task ${task.id} screenshot done. image size: ${imageBase64.length} bytes. Reporting status...`);
                task.reportStatus(STATUS_SUCCESS, imageBase64, null);
                log.debug(`Task ${task.id} done.`);
            } catch (e) {
                // handle screenshot error
                log.error(`task ${task.id} failed. reason: ${e.message}`);
                task.reportStatus(STATUS_FAILED, null, e.message);
            } finally {
                log.debug(`Task ${task.id} relasing resources...`);
                await closePage(task, page);
                log.debug(`Task ${task.id} resources released.`);
            }
        }).catch(async e => {
            log.error(`task ${task.id} failed. reason: ${e.message}`);
            task.reportStatus(STATUS_FAILED, null, e.message);
        }).finally(async () => {
            await inflightScreenShotTask.getAndIncrement(-1);
        })
    } catch(e) {
        // handle newPage error
        log.error(`task ${task.id} failed. reason: ${e.message}`);
        task.reportStatus(STATUS_FAILED, null, e.message);
        await inflightScreenShotTask.getAndIncrement(-1);
    } 
}

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function closePage(task, page) {
    if (page) {
        try {
            await page.close();
        } catch (e) {
            log.error(`task ${task.id} failed to close page. reason: ${e.message}`);
        }
    }
}
