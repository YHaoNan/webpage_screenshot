# Puppeteer AMD64 Image
FROM registry.cn-beijing.aliyuncs.com/tsingyun_middleware/tsingyun-openjdk:v8-jre-slim

# 设置工作目录(起始目录)
WORKDIR /webpage_screenshot_fe

################ 镜像制作 ################
# 镜像制作时的外部传参
ARG ARTIFACT_URL
# 拉取远程制品并解压到当前目录
RUN curl -L -o app.tar $ARTIFACT_URL \
    && tar -xvf app.tar -C .

################ 容器启动 ################

# 环境变量
# ENV XXX "VVV"

# 容器启动命令
ENTRYPOINT node index.js