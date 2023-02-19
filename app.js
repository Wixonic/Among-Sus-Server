const express = require("express");

const app = express();
const server = require("http").createServer(app);
const io = new (require("socket.io").Server)(server,{
	connectTimeout: 5000,
	pingInterval: 5000,
	pingTimeout: 10000,
	upgradeTimeout: 10000,
	
	reconnection: true,
	reconnectionAttempts: 5,

	maxHttpBufferSize: 1e6,
	path: "/ws",
	serveClient: false,

	cors: {
		origin: true
	}
});

const manager = {
	ips: {}
};

io.on("connection",(socket) => {
	if (manager.ips[socket.request.socket.remoteAddress] instanceof Array) {
		manager.ips[socket.request.socket.remoteAddress].push(socket.id);
	} else {
		manager.ips[socket.request.socket.remoteAddress] = [socket.id];
	}
	
	socket.on("disconnecting",() => {
		manager.ips[socket.request.socket.remoteAddress].splice((manager.ips[socket.request.socket.remoteAddress] || []).indexOf(socket.id),1);
	});

	socket.on("ping",(callback) => callback(Date.now()));
});

app.get("/",(_,res) => {
	res.redirect("https://github.com/Wixonic/Among-Sus-Server/pkgs/npm/among-sus-server#readme");
});

server.listen(3000,() => {
	console.info("Server is listening");
});