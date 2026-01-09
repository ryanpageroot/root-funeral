const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
    let filePath;
    
    if (req.url === '/embed') {
        filePath = path.join(__dirname, 'embed.html');
    } else if (req.url === '/dashboard') {
        filePath = path.join(__dirname, 'dashboard.html');
    } else {
        filePath = path.join(__dirname, 'index.html');
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Error loading page');
            return;
        }
        
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Development hub running at http://0.0.0.0:${PORT}`);
    console.log(`Embed preview available at http://0.0.0.0:${PORT}/embed`);
});