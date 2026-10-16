const http = require('http');

function startKeepAliveServer() {
  const PORT = process.env.PORT || 3000;

  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'online',
        uptime: process.uptime(),
        message: 'Discord Bot is active and running on Render!'
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(`[KeepAlive] Web server listening on port ${PORT} for Render uptime`);
  });

  return server;
}

module.exports = { startKeepAliveServer };
