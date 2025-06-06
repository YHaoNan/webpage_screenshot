import { requireNonNull } from './common.js'
import { parse } from 'ini'
import process from 'process'
import { log } from './logger.js'
import fs from 'fs'


class Config {
    constructor(env) {
        this.env = env
    }

    set(redisHost, redisPort, redisDB, redisUserName, redisPassword, queueName, consumeTimeout, chromePath, maxConcurrentInflightTask) {
        this.redisHost = redisHost
        this.redisPort = redisPort
        requireNonNull(this.redisHost, 
            'No [redisHost] found in local config file'
        );

        requireNonNull(this.redisPort, 
            'No [redisPort] found in local config file'
        );

        this.redisDB = redisDB
        if (this.redisDB === undefined) {
            log.warn(`No [redisDB] found in local config file. Fallback to 0`);
            this.redisDB = 0;
        }
        this.redisUserName = redisUserName;
        this.redisPassword = redisPassword;
        this.queueName = queueName
        requireNonNull(this.queueName, 
            'No [queueName] found in local config file'
        );
        this.consumeTimeout = consumeTimeout
        if (this.consumeTimeout === undefined) {
            log.warn(`No [consumeTimeout] found in local config file. Fallback to 10s`);
            this.consumeTimeout = 10;
        }
        this.chromePath = chromePath
        requireNonNull(this.chromePath, 
            'No [chromePath] found in local config file'
        );
        this.maxConcurrentInflightTask = maxConcurrentInflightTask
        if (this.maxConcurrentInflightTask === undefined) {
            log.warn(`No [maxConcurrentInflightTask] found in local config file. Fallback to 10`);
            this.maxConcurrentInflightTask = 10;
        }
    }

    async loadConfig() {
        throw new Error('Not implemented');
    }
}

class LocalFileConfig extends Config {
    constructor(env) {
        super(env);
        requireNonNull(env.config_file_path, 
            'No [config_file_path] found in env.ini'
        );
        log.info(`Using local config file: ${env.config_file_path}`);
    }

    loadConfig() {
        const configContent = fs.readFileSync(this.env.config_file_path, 'utf-8');
        const config = JSON.parse(configContent)
        console.log(config)
        super.set(
            config.redisHost,
            config.redisPort,
            config.redisDB,
            config.redisUserName,
            config.redisPassword,
            config.queueName,
            config.consumeTimeout,
            config.chromePath,
            config.maxConcurrentInflightTask
        )
    }
}


class NacosConfig extends Config {
    // const NacosNamingClient = require('nacos').NacosNamingClient;
    constructor(env) {
        super(env);
        requireNonNull(env.nacos_address, 
            'No [nacos_address] found in env.ini'
        );
        requireNonNull(env.nacos_namespace, 
            'No [nacos_namespace] found in env.ini'
        );
        requireNonNull(env.nacos_config_data_id, 
            'No [nacos_config_data_id] found in env.ini'
        );
        requireNonNull(env.nacos_config_group, 
            'No [nacos_config_group] found in env.ini'
        );
        
    }

    async loadConfig() {
        // log.info(`Initializing Nacos client...`)
        // const client = new NacosConfigClient({
        //     serverAddr: this.env.nacos_address,
        //     namespace: this.env.nacos_namespace,
        // });
        // log.info(`Done.`)
        // log.info(`Loading config from Nacos...`)
        // const remoteConfig = await client.getConfig(this.env.nacos_config_data_id, this.env.nacos_config_group);
        // log.info(`Done.`)
        // console.log(remoteConfig)
    }
}



async function initConfig() {
    const env = getEnv();
    log.info(`Active env: ${env}`)
    const envConfig = parseEnvConfigFile(env);
    log.debug(envConfig)

    requireNonNull(envConfig.config_type, 
        'No [config_type] found in env.ini'
    );

    let config = null;
    if (envConfig.config_type === 'localfile') {
        config = new LocalFileConfig(envConfig);
    } else if (envConfig.config_type === 'nacos') {
        config = new NacosConfig(envConfig);
    } else {
        throw new Error(`Unknown config type: ${envConfig.config_type}`);
    }
    await config.loadConfig()
    return config;
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
    const envFromFile = {
        ...globalConfig,
        ...currentEnvConfig
    }
    // Replace the envObject with the environment variables
    const envFromEnvironmentVariables = process.env;
    for (const key in envFromEnvironmentVariables) {
        if (key.startsWith('screenshot.')) {
            const realKey = key.replace('screenshot.', '');
            envFromFile[realKey] = envFromEnvironmentVariables[key];
        }
    }
    return envFromFile;
}

export { 
    initConfig
}