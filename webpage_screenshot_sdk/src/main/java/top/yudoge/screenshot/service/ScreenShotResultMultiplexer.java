package top.yudoge.screenshot.service;

import top.yudoge.screenshot.task.Task;
import top.yudoge.screenshot.task.TaskResult;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.stream.Collectors;

/**
 * This class is used to wait the result of tasks.
 *
 * We use multi-get to multiplex the result fetch times to reduce the network overhead and the redis overload.
 */
public class ScreenShotResultMultiplexer extends Thread {

    private Map<String, TaskWrapper> inflightTasks = new ConcurrentHashMap<>();
    private Map<String, TaskResult> taskResults = new ConcurrentHashMap<>();

    private ScreenShotResultFetcher screenShotResultFetcher;

    public ScreenShotResultMultiplexer(ScreenShotResultFetcher fetcher) {
        super("ScreenShotResultMultiplexer");
        this.setDaemon(true);
        this.screenShotResultFetcher = fetcher;
    }

    public TaskResult waitResult(Task task) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        TaskWrapper wrapper = new TaskWrapper(task, latch);
        inflightTasks.put(task.getId(), wrapper);
        // The timeout value is a suggestion now, we will be set a knob for each task later.
        try {
            boolean isDone = latch.await(10000, java.util.concurrent.TimeUnit.MILLISECONDS);

            TaskResult result = null;
            if (!isDone) {
                result =TaskResult.failed(task.getId(), "Timeout to waiting for result");
            } else if (taskResults.containsKey(task.getId())) {
                result = taskResults.get(task.getId());
            } else {
                result = TaskResult.failed(task.getId(), "Task result not found");
            }

            return result;
        } catch (InterruptedException e) {
            throw e;
        } catch (RuntimeException e) {
            throw e;
        } finally {
            inflightTasks.remove(task.getId());
        }
    }

    public void run() {
        while (true) {
            // 0. remove all task result that not in inflightTasks.
            // (maybe we have some task that reach timeout, but its result return later.)
            // (if we don't clear it, it will cause memory leak)
            for (String taskId : taskResults.keySet()) {
                if (!inflightTasks.containsKey(taskId)) {
                    taskResults.remove(taskId);
                }
            }

            // 1. try to fetch all task result
            List<TaskResult> fetchResults = screenShotResultFetcher.fetch(inflightTasks.values().stream().map(TaskWrapper::getTask).collect(Collectors.toList()));
            if (fetchResults == null || fetchResults.isEmpty()) { // nothing fetched
                try {
                    Thread.sleep(500);
                    continue;
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            // 2. process all the task results. put th result and notify the waiting threads.
            for (TaskResult result : fetchResults) {
                TaskWrapper taskWrapper = inflightTasks.get(result.getTaskId());
                if (Objects.nonNull(taskWrapper)) {
                    taskResults.put(result.getTaskId(), result);
                    taskWrapper.latch.countDown();
                }
            }

        }
    }


    private static class TaskWrapper {
        private Task task;
        private CountDownLatch latch;
        public TaskWrapper(Task task, CountDownLatch latch) {
            this.task = task;
            this.latch = latch;
        }

        public Task getTask() {
            return task;
        }
    }
}
