
const STATUS_FAILED = 0;
const STATUS_SUCCESS = 1;

/**
 * timeoutAt / resubmit等机制待实现
 */
class Task {

    constructor(
        id,  // 截图任务id
        url, // 截图任务页面url
        viewPort = {width: 1920, height: 1080}, // 截图任务页面视口
        headers = {}, // 截图任务页面自带请求头
        imageFormat = 'jpeg', // 截图格式
        imageQuality = 80, // 截图质量
        resubmitOnError = false, // TODO: 失败后重提交
        resubmitCount = 0,  // TODO: 重提交count
        maxResubmitCount = 3, // TODO: 最大重提交次数
        timeoutAt, // TODO: 超时时间
        delay = 0  // 延迟ms
    ) {
        this.id = id;
        this.url = url;
        this.viewPort = viewPort;
        this.imageFormat = imageFormat;
        this.imageQuality = imageQuality;
        this.headers = headers;
        this.resubmitOnError = resubmitOnError;
        this.resubmitCount = resubmitCount;
        this.maxResubmitCount = maxResubmitCount;
        this.timeoutAt = timeoutAt;
        this.delay = delay;
    }

    reportStatus(status, failedReason) {
        throw new Error('Method is not implemented!')
    }
}

class TaskQueue {
    /**
     * take a task from the queue
     * @returns Return a Promise<Task>
     */
    take() {
        throw new Error('Method is not implemented!')
    }
}

import Redis from 'ioredis';

class RedisTaskQueue extends TaskQueue {

    constructor(config) {
        super();
        // todo
        this.redis = new Redis({
            host: config.redisHost,
            port: config.redisPort,
            db: config.redisDB,
            username: config.redisUserName,
            password: config.redisPassword
        });
        this.config = config;
    }

    take() {
        return this.redis.lpop(this.config.queueName).then(
            taskStr => {
                if (taskStr) {
                    const task = JSON.parse(taskStr);
                    return new RedisTask(task.id, task.url, task.viewPort, task.imageFormat, task.imageQuality, task.headers, task.resubmitOnError, task.resubmitCount, task.maxResubmitCount, task.timeoutAt, this.redis, this.config);
                }
                return null;
            }
        )
    }

}

class RedisTask extends Task {

    constructor(id, url, viewPort, imageFormat, imageQuality, headers, resubmitOnError, resubmitCount, maxResubmitCount, timeoutAt, redis, config) {
        super(id, url, viewPort, imageFormat, imageQuality, headers, resubmitOnError, resubmitCount, maxResubmitCount, timeoutAt);
        this.redis = redis;
        this.config = config;
    }

    reportStatus(status, imageBase64, failedReason) {
        this.redis.set(
            `${this.config.queueName}:result:${this.id}`, 
            JSON.stringify({id: this.id, status, imageBase64, failedReason}),
            "EX",
            this.config.consumeTimeout
        );
    }

}

function initQueue(config) {
    return new RedisTaskQueue(config);
}

export {
    initQueue,
    STATUS_FAILED,
    STATUS_SUCCESS
}