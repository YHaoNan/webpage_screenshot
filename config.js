import { requireNonNull } from './common.js'
import { parse } from 'ini'
import process from 'process'
import logger from 'winston'
import fs from 'fs'


class Config {
    constructor(env) {
        this.env = env
        this.redisURL = ''
        this.redisDB = 0
        this.queueName = ''
        this.consumeTimeout = 0
    }

    set(redisURL, redisDB, queueName, consumeTimeout, chromePath) {
        this.redisURL = redisURL
        requireNonNull(this.redisURL, 
            'No [redisURL] found in local config file'
        );
        this.redisDB = redisDB
        if (this.redisDB === undefined) {
            logger.warn(`No [redisDB] found in local config file. Fallback to 0`);
            this.redisDB = 0;
        }
        this.queueName = queueName
        requireNonNull(this.queueName, 
            'No [queueName] found in local config file'
        );
        this.consumeTimeout = consumeTimeout
        if (this.consumeTimeout === undefined) {
            logger.warn(`No [consumeTimeout] found in local config file. Fallback to 10s`);
            this.consumeTimeout = 10;
        }
        this.chromePath = chromePath
        requireNonNull(this.chromePath, 
            'No [chromePath] found in local config file'
        );
    }
}

class LocalFileConfig extends Config {
    constructor(env) {
        super(env);
        requireNonNull(env.file_path, 
            'No [file_path] found in env.ini'
        );
        logger.info(`Using local config file: ${env.file_path}`);
        const configContent = fs.readFileSync(env.file_path, 'utf-8');
        const config = JSON.parse(configContent)
        super.set(
            config.redisURL,
            config.redisDB,
            config.queueName,
            config.consumeTimeout,
            config.chromePath
        )
    }
}


class NacosConfig extends Config {
    // const NacosNamingClient = require('nacos').NacosNamingClient;
    constructor() {
    }
}



function initConfig() {
    const env = getEnv();
    logger.info(`Active env: ${env}`)
    const envConfig = parseEnvConfigFile(env);
    logger.debug(envConfig)

    requireNonNull(envConfig.config_type, 
        'No [config_type] found in env.ini'
    );

    if (envConfig.config_type === 'localfile') {
        return new LocalFileConfig(envConfig);
    } else if (envConfig.config_type === 'nacos') {
        return new NacosConfig(envConfig);
    } else {
        throw new Error(`Unknown config type: ${envConfig.config_type}`);
    }
}

function getEnv() {
    let env = process.env.ENV;
    requireNonNull(env, 
        'No [ENV] found in environment variables'
    );
    return env;
}

function parseEnvConfigFile(env) {
    const config = fs.readFileSync('./env.ini', 'utf-8');
    const parsedConfig = parse(config);
    const globalConfig = parsedConfig.global;
    const currentEnvConfig = parsedConfig[env];
    return {
        ...globalConfig,
        ...currentEnvConfig
    }
}

export { 
    initConfig
}