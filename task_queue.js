
const STATUS_FAILED = 0;
const STATUS_SUCCESS = 1;

class Task {

    constructor(
        id,
        url,
        viewPort = {width: 1920, height: 1080},
        headers = {},
        imageFormat = 'jpeg',
        imageQuality = 80
    ) {
        this.id = id;
        this.url = url;
        this.viewPort = viewPort;
        this.imageFormat = imageFormat;
        this.imageQuality = imageQuality;
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
        this.redis = new Redis(config.redisURL);
        this.config = config;
    }

    take() {
        return this.redis.lpop(this.config.queueName).then(
            taskStr => {
                if (taskStr) {
                    const task = JSON.parse(taskStr);
                    return new RedisTask(task.id, task.url, task.viewPort, task.imageFormat, task.imageQuality, this.redis, this.config);
                }
                return null;
            }
        )
    }

}

class RedisTask extends Task {

    constructor(id, url, viewPort, imageFormat, imageQuality, redis, config) {
        super(id, url, viewPort, imageFormat, imageQuality);
        this.redis = redis;
        this.config = config;
    }

    reportStatus(status, imageBase64, failedReason) {
        this.redis.set(
            `${this.config.queueName}:result:${this.id}`, 
            JSON.stringify({status, imageBase64, failedReason}),
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