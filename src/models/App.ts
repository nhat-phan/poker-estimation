import { Room } from './Room'
import { Socket, Server } from 'socket.io'

export class App {
  protected server: Server
  protected rooms: { [key in string]: Room }

  constructor(io: Server) {
    this.server = io
    this.rooms = {}
  }

  hasRoom(roomId: string): boolean {
    return typeof this.rooms !== 'undefined' && typeof this.rooms[roomId] !== 'undefined'
  }

  newRoom(creator: Socket) {
    let roomId = this.generateRoomId()
    while (this.hasRoom(roomId)) {
      roomId = this.generateRoomId()
    }

    const room = new Room(creator, roomId)
    this.rooms[roomId] = room
    return room
  }

  findRoom(roomId: string): Room | undefined {
    const id = roomId
      .trim()
      .split(' ')
      .join('')

    return this.rooms[id]
  }

  clear(): this {
    for (const roomId in this.rooms) {
      if (typeof this.server.sockets.adapter.rooms[roomId] === 'undefined') {
        delete this.rooms
      }
    }

    if (!this.rooms) {
      this.rooms = {}
    }
    return this
  }

  generateRoomId() {
    let result = ''
    while (result.length < 9) {
      result += Math.floor(Math.random() * 10000000000) % 10
    }
    return result
  }
}
