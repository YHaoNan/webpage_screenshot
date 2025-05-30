package top.yudoge.screenshot.task;

public interface TaskQueue {

    void submit(Task task);

    int size();

}
