"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Estimation {
    constructor(players) {
        this.data = {};
        this.done = false;
        this.players = players;
        for (const player of players) {
            // tslint:disable-next-line
            this.data[player.socketId] = null;
        }
    }
    isDone() {
        return this.done || this.players.length === this.getPlayedCount();
    }
    getPlayedCount() {
        return Object.keys(this.data).reduce((count, id) => {
            // tslint:disable-next-line
            if (this.data[id] !== null) {
                return count++;
            }
            return count;
        }, 0);
    }
    close() {
        this.done = true;
        return this;
    }
    add(socket, value) {
        const player = this.players.find(p => p.socketId === socket.id);
        if (player) {
            this.data[player.socketId] = value;
        }
    }
    getResult() {
        if (this.isDone()) {
            return this.data;
        }
        const result = {};
        for (const id in this.data) {
            result[id] = '-';
        }
        return result;
    }
}
exports.Estimation = Estimation;
//# sourceMappingURL=Estimation.js.map