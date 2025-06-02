package top.yudoge.screenshot.task;

public enum ImageFormatEnum {
    PNG("png"),
    JPEG("jpeg")
    ;
    private String format;

    ImageFormatEnum(String format) {
        this.format = format;
    }

    public String getFormat() {
        return format;
    }
}
