'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const moment = require('moment');

const filepath = path.join(__dirname, '.', "generated.json");
let logFileName = 'log_file.txt';
const logFilePath = path.join(__dirname, '.', logFileName);

// get file mime-type
let fileMimeType = mime.contentType(filepath).split(';')[0];

// add logs to log file function
let logging = (file, data) => {
    fs.appendFile(file, data, (err) => {
        console.log('Added info to log file.');
    });
};

// checking whether the log exists if not - create it - prevents doubling the first string in the file('start the log file')
if(fs.existsSync(logFilePath)){
    console.log('Log file is ready.');
} else{    
    // fs.appendFile('log_file.txt', 'Start of the log file:', () => {
    //     console.log('Log file is created and ready.');
    // });
    logging(logFileName, 'Start of the log file:\n');
}

// create server
const server = new http.Server();

server.on('request', (req, res) => {
    
    let startDate = new Date();
    console.log(startDate.toLocaleTimeString());

    let mom1 = new Date().getSeconds(); 

    if(req.method == 'GET' && req.url == '/'){
        
        logging(logFileName, `\nSending start time: ${startDate.toLocaleTimeString()} ${startDate.toLocaleDateString()}\n`);
        
        res.writeHead(200, {'Content-type': fileMimeType});
        // create stream and send chinks with response
        const stream = fs.createReadStream(filepath, {highWaterMark: 10000});
        stream.pipe(res);

        stream.once('readable', () => {
            // console.log('file is readable');
        });

        stream.on('data', (chunk) => {
            // console.log(chunk.length);
        });

        stream.on('end', (chunk) => {
            console.log('Sending finished.');
            // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
        });

        stream.on('close', () => {
            console.log('Connection closed.');
            let finishDate = new Date();

            logging(logFileName, `Sending finish time: ${finishDate.toLocaleTimeString()} ${finishDate.toLocaleDateString()}\n`);

            let mom2 = new Date().getMilliseconds();
            let timeTaken = mom2 - mom1;
            console.log(mom2 - mom1);
            logging(logFileName, `Sending took ${timeTaken/1000}s. and finished with status code ${res.statusCode}\n\n`);
        });

        console.log(res.statusCode);

    } else{
        res.writeHead(404);
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));

// log requests and response info every minute
let logMinute = () => {
    
    // logging(logFileName, `On: ${logMinuteDate.toLocaleTimeString()} ${logMinuteDate.toLocaleDateString()} got:\n
    //                         `);
};

let logTimer = setInterval(() => {
    let logMinuteDate = new Date();
    logging(logFileName, `checking forever!!!11 ${logMinuteDate.toLocaleTimeString()}\n\n`);
}, 10000); // change to 60 000 later
