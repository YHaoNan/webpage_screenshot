class Config {
    constructor() {
        this.redisURL = 'localhost:6379';
        this.redisDB = 0;
        this.queueName = 'webpage_screenshot:taskqueue';
        // 截图结果多少s内不消费自动过期
        this.consumeTimeout = 10;
    }
}

function initConfig() {
    return new Config();
}

export { 
    initConfig
}