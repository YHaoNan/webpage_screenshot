import { BrowserPool } from '../browser_pool.js';
import { Task } from '../task.js';

const pool = new BrowserPool(2);

pool.init().then(() => {
    console.log("pool initialized");
    pool.listBrowsers()[0].screenshot(
        new Task(
            'http://baidu.com',
            { width: 1024, height: 768 },
            null,
            null,
            null
        )
    ).then(base64Image => {
        console.log(base64Image);
    });
});
