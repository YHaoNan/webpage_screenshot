var winston = require('winston');
var path = require('path');

// Set this to whatever, by default the path of the script.
var logPath = __dirname;
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
    
    
module.exports = {
    log
};