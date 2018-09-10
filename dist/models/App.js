"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = require("./Room");
class App {
    constructor(io) {
        this.server = io;
        this.rooms = {};
    }
    hasRoom(roomId) {
        return typeof this.rooms !== 'undefined' && typeof this.rooms[roomId] !== 'undefined';
    }
    newRoom(creator) {
        let roomId = this.generateRoomId();
        while (this.hasRoom(roomId)) {
            roomId = this.generateRoomId();
        }
        const room = new Room_1.Room(creator, roomId);
        this.rooms[roomId] = room;
        return room;
    }
    findRoom(roomId) {
        const id = roomId
            .trim()
            .split(' ')
            .join('');
        return this.rooms[id];
    }
    clear() {
        for (const roomId in this.rooms) {
            if (typeof this.server.sockets.adapter.rooms[roomId] === 'undefined') {
                delete this.rooms;
            }
        }
        if (!this.rooms) {
            this.rooms = {};
        }
        return this;
    }
    generateRoomId() {
        let result = '';
        while (result.length < 9) {
            result += Math.floor(Math.random() * 10000000000) % 10;
        }
        return result;
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map