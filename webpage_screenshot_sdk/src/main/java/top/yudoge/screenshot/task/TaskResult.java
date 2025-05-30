package top.yudoge.screenshot.task;

public class TaskResult {

    /**
     * task id
     */
    private String taskId;

    /**
     * Task status: 0-failed, 1-success
     */
    private Integer status;

    /**
     * Task result image base64 string
     */
    private String imageBase64;

    /**
     * Failed reason if task failed
     */
    private String failedReason;

    public TaskResult(String taskId, Integer status, String imageBase64, String failedReason) {
        this.taskId = taskId;
        this.status = status;
        this.imageBase64 = imageBase64;
        this.failedReason = failedReason;
    }

    public String getTaskId() {
        return taskId;
    }

    public Integer getStatus() {
        return status;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public String getFailedReason() {
        return failedReason;
    }

    public boolean isSuccess() {
        return status == SUCCESS;
    }

    public static TaskResult success(String taskId, String imageBase64) {
        return new TaskResult(taskId, SUCCESS, imageBase64, null);
    }
    public static TaskResult failed(String taskId, String failedReason) {
        return new TaskResult(taskId, FAILED, null, failedReason);
    }

    public static final Integer SUCCESS = 1;
    public static final Integer FAILED = 0;

}
