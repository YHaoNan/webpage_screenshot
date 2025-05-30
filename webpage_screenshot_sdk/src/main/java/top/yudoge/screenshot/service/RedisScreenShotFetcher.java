package top.yudoge.screenshot.service;

import top.yudoge.screenshot.task.Task;
import top.yudoge.screenshot.task.TaskResult;

import java.util.List;

public class RedisScreenShotFetcher implements ScreenShotResultFetcher {
    @Override
    public List<TaskResult> fetch(List<Task> taskList) {
        throw new UnsupportedOperationException("RedisScreenShotFetcher not implemented yet");
    }


}
