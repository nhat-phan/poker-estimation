"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Estimation_1 = require("./Estimation");
class Room {
    constructor(host, roomId) {
        this.roomId = roomId;
        this.members = [];
        this.members.push({
            socketId: host.id,
            name: 'unknown',
            role: 'creator'
        });
    }
    get id() {
        return this.roomId;
    }
    addMember(socket, name, role) {
        this.members.push({
            socketId: socket.id,
            name: name,
            role: role
        });
    }
    removeMember(socket) {
        this.members = this.members.filter(i => i.socketId !== socket.id);
    }
    getCreator() {
        return this.members.find(i => i.role === 'creator');
    }
    getMembers() {
        return this.members;
    }
    getPlayers() {
        return this.members.filter(i => i.role === 'player');
    }
    getHosts() {
        return this.members.filter(i => i.role === 'host');
    }
    getEstimation() {
        return this.estimation;
    }
    startEstimation(socket) {
        if (this.canStartEstimation(socket)) {
            this.estimation = new Estimation_1.Estimation(this.getPlayers());
            return true;
        }
        return false;
    }
    canStartEstimation(socket) {
        if (this.estimation && !this.estimation.isDone()) {
            return false;
        }
        if (socket.id === this.getCreator().socketId) {
            return true;
        }
        return !!this.getHosts().find(m => m.socketId === socket.id);
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map