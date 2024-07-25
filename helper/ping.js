const net = require('net');

async function TestTCPLatency(host, port, timeout, callback) {
  const startTime = Date.now();
  const socket = net.createConnection({ host, port });
  // sockets[host] = socket; // 使用编号作为键，存储连接对象

  socket.on('connect', () => {
    const latency = Date.now() - startTime;
    socket.destroy(); // 关闭连接
    callback(null, latency, host, port);
  });
  socket.setTimeout(1000);
  socket.on('error', (err) => {
    socket.destroy();
    callback(err, "unknown", host, port);
  });
}

module.exports = {TestTCPLatency};