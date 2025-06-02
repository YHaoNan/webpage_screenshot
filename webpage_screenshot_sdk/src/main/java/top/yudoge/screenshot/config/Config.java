package top.yudoge.screenshot.config;

public class Config {

    private String redisURL;

    private String redisDB;

    private String queueName;

    private String maxQueueSize;

    public Config(
            String redisURL,
            String redisDB,
            String queueName,
            String maxQueueSize
    ) {
        this.redisURL = redisURL;
        this.redisDB = redisDB;
        this.queueName = queueName;
        this.maxQueueSize = maxQueueSize;
    }

    public String getMaxQueueSize() {
        return maxQueueSize;
    }

    public String getQueueName() {
        return queueName;
    }

    public String getRedisDB() {
        return redisDB;
    }

    public String getRedisURL() {
        return redisURL;
    }
}
