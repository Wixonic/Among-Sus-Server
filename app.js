const fs = require("fs");
const audioconcat  = require("audioconcat");

const express = require("express");
const { instrument } = require("@socket.io/admin-ui");
const { Server } = require("socket.io");

const app = express();
const server = require("https").createServer({
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.pem")
},app);

const io = new Server(server,{
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
		origin: ["http://localhost:5050","https://wixonic-among-sus.web.app","https://sus.wixonic.fr","https://admin.socket.io"],
		credentials: true
	}
});

class User {
	static list = {};

	constructor (socket) {
		this.id = socket.id;
		this.position = {
			x: 0,
			y: 0,
			z: 0
		};
	};
};

io.on("connection",async (socket) => {
	User.list[socket.id] = new User(socket);

	io.of("/").except(socket.id).emit("signal",socket.id,0);

	socket.on("signal",(to,state,...args) => io.of("/").in(to).emit("signal",socket.id,state,...args));

	setInterval(() => io.of("/").emit("list",User.list),100);

	socket.on("ping",(callback) => callback(Date.now()));
});

app.get("/",(_,res) => res.redirect("https://github.com/Wixonic/Among-Sus-Server/pkgs/npm/among-sus-server#readme"));

instrument(io,{
	auth: false,
	mode: "development"
});

server.listen(3000,() => console.log("Server is listening on " + server.address().address + ":" + server.address().port));