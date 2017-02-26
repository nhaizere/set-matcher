var http = require('http');
var port = process.env.port || 8000;
http.createServer(function (req, res) {
    if (req.url === '/favicon.ico') {
        r.writeHead(200, { 'Content-Type': 'image/x-icon' });
        r.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);