import { Member } from './Room'
import { Socket } from 'socket.io'

export class Estimation {
  protected data: { [key in string]: string | null }
  protected done: boolean
  protected players: Member[]

  constructor(players: Member[]) {
    this.data = {}
    this.done = false
    this.players = players
    for (const player of players) {
      // tslint:disable-next-line
      this.data[player.socketId] = null
    }
  }

  isDone(): boolean {
    return this.done || this.players.length === this.getPlayedCount()
  }

  getPlayedCount(): number {
    return Object.keys(this.data).reduce((count: number, id: string) => {
      // tslint:disable-next-line
      if (this.data[id] !== null) {
        return count++
      }
      return count
    }, 0)
  }

  close(): this {
    this.done = true

    return this
  }

  add(socket: Socket, value: string): void {
    const player = this.players.find(p => p.socketId === socket.id)
    if (player) {
      this.data[player.socketId] = value
    }
  }

  getResult() {
    if (this.isDone()) {
      return this.data
    }

    const result = {}
    for (const id in this.data) {
      result[id] = '-'
    }
    return result
  }
}
