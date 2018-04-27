'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const filepath = path.join(__dirname, '.', "generated.json");

const stream = fs.createReadStream(filepath);

stream.once('readable', () => {
    console.log(filepath, 'is readable');
    console.log(mime.contentType(filepath).split(';')[0]);
    stream.destroy();
});

const server = new http.Server();

server.on('request', (req, res) => {
    if(req.method == 'GET' && req.url == '/'){
        console.log(filetype(filepath));
    } else{
        res.writeHead(404);
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));