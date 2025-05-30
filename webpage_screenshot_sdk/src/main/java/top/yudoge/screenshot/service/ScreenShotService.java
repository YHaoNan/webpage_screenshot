package top.yudoge.screenshot.service;

import top.yudoge.screenshot.config.Config;
import top.yudoge.screenshot.task.Task;
import top.yudoge.screenshot.task.TaskQueue;
import top.yudoge.screenshot.task.TaskResult;

public class ScreenShotService {

    private final ScreenShotResultMultiplexer resultMultiplexer;

    private final TaskQueue taskQueue;

    private final Config config;

    private ScreenShotService(TaskQueue taskQueue, ScreenShotResultFetcher resultFetcher, Config config) {
        // init redis client
        // start background thread to handle screenshot request batched
        this.taskQueue = taskQueue;
        this.config = config;
        this.resultMultiplexer = new ScreenShotResultMultiplexer(resultFetcher);
        this.resultMultiplexer.start();
    }

    public TaskResult screenShot(Task task) {

        // 0. check if task queue is full
        int maxQueueSize = config.getMaxQueueSize();
        if (taskQueue.size() >= maxQueueSize) {
            return TaskResult.failed(task.getId(), "Task queue is full");
        }

        // 1. submit task to redis queue
        taskQueue.submit(task);

        try {
            // 2. wait for result and return it
            TaskResult taskResult = this.resultMultiplexer.waitResult(task);
            return taskResult;
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public static ScreenShotService getInstance(TaskQueue taskQueue, ScreenShotResultFetcher resultFetcher, Config config) {
        return new ScreenShotService(taskQueue, resultFetcher, config);
    }
}
