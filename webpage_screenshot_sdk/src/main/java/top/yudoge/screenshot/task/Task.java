package top.yudoge.screenshot.task;

import top.yudoge.screenshot.utils.StrUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class Task {

    /**
     * The unique id of the task. We use this to fetch the task result.
     */
    private String id;

    /**
     * The url of the page to screenshot.
     */
    private String url;

    /**
     * The view port of the page to screenshot. Not required.
     */
    private ViewPort viewPort;

    /**
     * The image format of the screenshot. For supported format @see ImageFormatEnum.
     */
    private String imageFormat;

    /**
     * The quality of the screenshot. Not required. 0-100.
     */
    private Integer quality;

    /**
     * The extra headers to add to the request. Not required.
     */
    private Map<String, String> headers;

    /**
     * If the task run failed, whether to resubmit it. Not required. Not implemented now.
     */
    private Boolean resubmitOnError;

    /**
     * The maximum number of resubmits. Not required. Not implemented now.
     */
    private Integer maxResubmitCount;

    /**
     * The timeout of the task. Not required. Not implemented now.
     */
    private LocalDateTime timeoutAt;



    public Task() {}


    public String getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public ViewPort getViewPort() {
        return viewPort;
    }

    public String getImageFormat() {
        return imageFormat;
    }

    public Integer getQuality() {
        return quality;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }

    public Boolean getResubmitOnError() {
        return resubmitOnError;
    }

    public Integer getMaxResubmitCount() {
        return maxResubmitCount;
    }

    public LocalDateTime getTimeoutAt() {
        return timeoutAt;
    }

    public static class Builder {
        private Task task;

        public Builder() {
            task = new Task();
        }

        public Builder id(String id) {
            if (StrUtils.isBlank(id)) {
                throw new IllegalArgumentException("id is blank");
            }
            task.id = id;
            return this;
        }

        public Builder url(String url) {
            if (StrUtils.isBlank(url)) {
                throw new IllegalArgumentException("id is blank");
            }
            task.url = url;
            return this;
        }

        public Builder viewPort(ViewPort viewPort) {
            task.viewPort = viewPort;
            return this;
        }

        public Builder imageFormat(ImageFormatEnum imageFormat) {
            task.imageFormat = imageFormat.getFormat();
            return this;
        }

        public Builder quality(int quality) {
            if (quality < 0 || quality > 100) {
                throw new IllegalArgumentException("quality must be between 0 and 100");
            }
            task.quality = quality;
            return this;
        }

        public Builder headers(Map<String, String> headers) {
            task.headers = headers;
            return this;
        }

        public Builder addHeader(String key, String value) {
            if (task.headers == null) {
                task.headers = new HashMap<>();
            }
            task.headers.put(key, value);
            return this;
        }

        public Builder resubmitOnError(Boolean resubmitOnError) {
            task.resubmitOnError = resubmitOnError;
            return this;
        }

        public Builder maxResubmitCount(Integer maxResubmitCount) {
            task.maxResubmitCount = maxResubmitCount;
            return this;
        }

        public Builder timeoutAt(LocalDateTime timeoutAt) {
            task.timeoutAt = timeoutAt;
            return this;
        }

        public Task build() {
            if (StrUtils.isBlank(task.id) || StrUtils.isBlank(task.url)) {
                throw new IllegalArgumentException("Task id and url are required");
            }
            return task;
        }

    }
}
