package top.yudoge.screenshot.task;

public class TaskResult {

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

    public TaskResult(Integer status, String imageBase64, String failedReason) {
        this.status = status;
        this.imageBase64 = imageBase64;
        this.failedReason = failedReason;
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

    public static TaskResult success(String imageBase64) {
        return new TaskResult(SUCCESS, imageBase64, null);
    }
    public static TaskResult failed(String failedReason) {
        return new TaskResult(FAILED, null, failedReason);
    }

    public static final Integer SUCCESS = 1;
    public static final Integer FAILED = 0;

}
