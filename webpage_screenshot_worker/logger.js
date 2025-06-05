import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path'

// Set this to whatever, by default the path of the script.
const logPath = path.join(dirname(fileURLToPath(import.meta.url)), 'logs');
const tsFormat = () => (new Date().toISOString());
    
const log = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, 'ws.log'),
            timestamp: tsFormat,
            level: 'info'
        }),
        new winston.transports.Console({
            timestamp: tsFormat,
            level: 'debug'
        })
    ]
});
    
    
export {log}