package top.yudoge.screenshot.service;

import top.yudoge.screenshot.config.Config;
import top.yudoge.screenshot.task.Task;
import top.yudoge.screenshot.task.TaskResult;

public class ScreenShotService {

    private final ScreenShotResultMultiplexer resultMultiplexer;

    private ScreenShotService() {
        // init redis client
        // start background thread to handle screenshot request batched
        this.resultMultiplexer = new ScreenShotResultMultiplexer();
        this.resultMultiplexer.start();
    }

    public TaskResult screenShot(Task task) {

        // 0. check if task queue is full

        // 1. submit task to redis queue

        try {
            // 2. wait for result and return it
            TaskResult taskResult = this.resultMultiplexer.waitResult(task);
            return taskResult;
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public static ScreenShotService getInstance(Config config) {
        return new ScreenShotService();
    }
}
