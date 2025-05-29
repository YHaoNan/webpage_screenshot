/**
 * Task represents a web page screenshot task.
 * It only contains the url of the web page now. 
 */
class Task {

    constructor(url, viewport = {width: 1024, height: 768}, headers = null, imageFormat = null, imageQuality = null) {
        this.url = url;
        this.viewport = viewport;
        this.headers = headers;
        this.imageFormat = imageFormat;
        this.imageQuality = imageQuality;
    }

}

export { Task };
