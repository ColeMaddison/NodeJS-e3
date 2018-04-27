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
    logging(logFileName, 'Start of the log file:');
}

let someDate = new Date();

console.log(someDate.toString());

// create server
const server = new http.Server();

server.on('request', (req, res) => {
    
    let mom1 = new Date().getSeconds(); 

    if(req.method == 'GET' && req.url == '/'){
        res.writeHead(200, {'Content-type': fileMimeType});
        // create stream and send chinks with response
        const stream = fs.createReadStream(filepath, {highWaterMark: 10000});
        stream.pipe(res);

        stream.once('readable', () => {
            // console.log('file is readable');
        });

        stream.on('data', (chunk) => {
            console.log(chunk.length);
        });

        stream.on('end', (chunk) => {
            console.log('Sending finished.');
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
            let mom2 = new Date().getMilliseconds();
            console.log(mom2 - mom1);
        });

        stream.on('close', () => {
            console.log('Closed by user.');
        });

    } else{
        res.writeHead(404);
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
