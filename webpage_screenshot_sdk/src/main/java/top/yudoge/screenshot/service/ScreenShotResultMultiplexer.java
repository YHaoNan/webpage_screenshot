package top.yudoge.screenshot.service;

import top.yudoge.screenshot.task.Task;
import top.yudoge.screenshot.task.TaskResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;

/**
 * This class is used to wait the result of tasks.
 *
 * We use multi-get to multiplex the result fetch times to reduce the network overhead and the redis overload.
 */
public class ScreenShotResultMultiplexer extends Thread {

    private Map<String, TaskWrapper> inflightTasks = new ConcurrentHashMap<>();
    private Map<String, TaskResult> taskResults = new ConcurrentHashMap<>();

    public TaskResult waitResult(Task task) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        TaskWrapper wrapper = new TaskWrapper(task, latch);
        inflightTasks.put(task.getId(), wrapper);
        // The timeout value is a suggestion now, we will be set a knob for each task later.
        boolean isDone = latch.await(10000, java.util.concurrent.TimeUnit.MILLISECONDS);

        TaskResult result = null;
        if (!isDone) {
            result =TaskResult.failed("Timeout to waiting for result");
        } else if (taskResults.containsKey(task.getId())) {
            result = taskResults.get(task.getId());
            // we don't clear result immediately,
            // it will be cleared only by run() periodically to avoid potential collision.
        } else {
            result = TaskResult.failed("Task result not found");
        }

        inflightTasks.remove(task.getId());
        return result;
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

            Set<String> allIds = inflightTasks.keySet();
            // redis multi-get
            // if any task is done
            List<String> doneTaskIds = new ArrayList<>();
        }
    }

    private static class TaskWrapper {
        private Task task;
        private CountDownLatch latch;
        public TaskWrapper(Task task, CountDownLatch latch) {
            this.task = task;
            this.latch = latch;
        }
    }
}
