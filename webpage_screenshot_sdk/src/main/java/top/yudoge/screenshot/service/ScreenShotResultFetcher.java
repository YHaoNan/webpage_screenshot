package top.yudoge.screenshot.service;


import top.yudoge.screenshot.task.Task;
import top.yudoge.screenshot.task.TaskResult;

import java.util.List;

/**
 * A interface that defines how to fetch the result of the tasks.
 */
public interface ScreenShotResultFetcher {

    /**
     * Fetch the result of the tasks.
     * <p/>
     * This method doesn't block the caller thread. It will return a list that only contains the results of
     * the tasks that have been completed.
     * <p/>
     * If no task is completed, the result list will be empty.
     *
     * @param taskList
     * @return
     */
    List<TaskResult> fetch(List<Task> taskList);

}
