'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const filepath = path.join(__dirname, '.', "generated.json");

// get file mime-type
let fileMimeType = mime.contentType(filepath).split(';')[0];

// create server
const server = new http.Server();

server.on('request', (req, res) => {
    if(req.method == 'GET' && req.url == '/'){
        res.writeHead(200, {'Content-type': fileMimeType});

        const stream = fs.createReadStream(filepath, {highWaterMark: 10000});
        stream.pipe(res);

        stream.on('readable', () => {
            console.log('file is readable');
        });

        stream.on('data', (chunk) => {
            console.log(chunk.length);
        });

        stream.on('end', (chunk) => {
            console.log('Sending finished.');
        });

    } else{
        res.writeHead(404);
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
