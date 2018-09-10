"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const SocketIO = require("socket.io");
const Http = require("http");
const Path = require("path");
const PokerEstimation_1 = require("./lib/PokerEstimation");
const port = process.env.PORT || 8080;
const express = Express();
express.use(Express.static(Path.resolve(__dirname, '../public')));
const server = Http.createServer(express);
const io = SocketIO(server);
server.listen(port, function () {
    console.info('Listening to port ' + port);
});
const app = new PokerEstimation_1.PokerEstimation(io);
io.on('connection', function (socket) {
    socket.on('create-room', function () {
        app.createRoom(socket);
    });
    socket.on('join-room', function (data) {
        app.joinRoom(socket, data);
    });
    socket.on('get-players', function (roomId) {
        app.getPlayers(socket, roomId);
    });
    socket.on('close-room', function (roomId) {
        app.closeRoom(socket, roomId);
    });
    socket.on('bye', function (roomId) {
        app.memberLeave(socket, roomId);
    });
    socket.on('start-estimation', function (data) {
        app.createEstimation(socket, data);
    });
    socket.on('estimate', function (data) {
        app.estimate(socket, data);
    });
    socket.on('get-estimation-result', function (roomId) {
        app.getEstimateResult(socket, roomId);
    });
});
//# sourceMappingURL=index.js.map