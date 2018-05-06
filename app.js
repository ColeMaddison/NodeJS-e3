'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const moment = require('moment');

const filepath = path.join(__dirname, "generated.json");
let logFileName = 'log_file.txt';
const logFilePath = path.join(__dirname, logFileName);

// response info obj - use for logging res url, user agent, total response handle time - info for all requests
let resInfo = {};
resInfo = {
    reqCounter: 0,
    connectionInfo: [] // userAgents: [], urls: [], totalResTime: 0
};

// get file mime-type
let fileMimeType = mime.contentType(filepath).split(';')[0];

// add logs to log file function
// let logging = (file, data) => {
//     fs.appendFile(file, data, (err) => {
//         console.log('Added info to log file.');
//     });
// };

let logging = (file, data) => {
    let writeStream = fs.createWriteStream(file, {'flags': 'a'});
    writeStream.write(data);
    writeStream.end();
};

// checking whether the log exists if not - create it - prevents doubling the first string in the file('start the log file')
if(fs.existsSync(logFilePath)){
    console.log('Log file is ready.');
} else{
    logging(logFileName, 'Start of the log file:\n');
}

// create server
const server = new http.Server();

server.on('request', (req, res) => {
    
    // get date of the request
    let startDate = new Date();

    // get starting second of the request
    let mom1 = new Date().getSeconds(); 

    if(req.method == 'GET' && req.url == '/'){

        // connection info for one request
        let reqResInfo = {
            userAgent: req ? req.headers['user-agent'] : "Nothing requested",
            url: req.url,
            totalResTime: 0
        };

        // increase counter on every req
        resInfo.reqCounter++;
        
        logging(logFileName, `\nSending start time: ${startDate.toLocaleTimeString()} ${startDate.toLocaleDateString()}\n`);
        
        res.writeHead(200, {'Content-type': fileMimeType});
        // create stream and send chinks with response
        const stream = fs.createReadStream(filepath, {highWaterMark: 10000});
        stream.pipe(res);

        stream.on('end', (chunk) => {
            console.log('Sending finished.');
        });

        stream.on('close', () => {
            console.log('Connection closed.');
            let finishDate = new Date();

            logging(logFileName, `Sending finish time: ${finishDate.toLocaleTimeString()} ${finishDate.toLocaleDateString()}\n`);

            // get finishing second of the request
            let mom2 = new Date().getMilliseconds();
            let timeTaken = mom2 - mom1;
            
            reqResInfo.totalResTime = timeTaken;

            logging(logFileName, `Sending took ${timeTaken/1000}s. and finished with status code ${res.statusCode}\n\n`);
        });
        resInfo.connectionInfo.push(reqResInfo);

    } else{
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));

// log requests and response info every minute
let logTimer = setInterval(() => {
    // get the reqinfo connection array
    let reqConnection = resInfo.connectionInfo;

    // array for gathering req-res information
    let conArr = [];

    if(resInfo.reqCounter){
        conArr = reqConnection.map((item) => {
            return `\tUser agent: ${item.userAgent},---- URL: ${item.url},---- Time taken: ${item.totalResTime}ms`;
        });
    } else {
        conArr.push('Nothing requested.');
    }

    let logMinuteDate = new Date();
    logging(logFileName, `\nEvery minute check: ${logMinuteDate.toLocaleTimeString()}\nRequests info:\n${conArr.join('\n')}\n\n`);
    resInfo.reqCounter = 0;
}, 60000); // change to 60 000 later
