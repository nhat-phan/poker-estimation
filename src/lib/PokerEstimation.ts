import { App } from '../models/App'
import { Socket, Server } from 'socket.io'

type JoinRoom = { roomId: string; name: string }
type StartEstimation = { roomId: string; time: number }
type EstimateData = { roomId: string; value: string }

export class PokerEstimation {
  protected app: App
  protected io: Server

  constructor(io: Server) {
    this.app = new App(io)
    this.io = io
  }

  createRoom(socket: Socket) {
    const room = this.app.clear().newRoom(socket)

    socket.join(room.id).emit('room-created', room.id)
  }

  joinRoom(socket: Socket, data: JoinRoom) {
    const room = this.app.findRoom(data.roomId)

    if (!room) {
      socket.emit('cannot-join')
      socket.disconnect()
      return
    }

    room.addMember(socket, data.name, 'player')
    socket.join(room.id).emit('joined', room.id)
    socket.broadcast.to(room.id).emit('player-updated')
  }

  getPlayers(socket: Socket, roomId: string) {
    const room = this.app.findRoom(roomId)

    if (room) {
      socket.emit('get-players-response', room.getPlayers())
    }
  }

  closeRoom(socket: Socket, roomId: string) {
    const room = this.app.findRoom(roomId)

    if (room) {
      const members = room.getMembers()
      for (const member of members) {
        if (typeof this.io.sockets.sockets[member.socketId] !== 'undefined') {
          this.io.sockets.sockets[member.socketId].disconnect()
        }
      }
    }
  }

  memberLeave(socket: Socket, roomId: string) {
    const room = this.app.findRoom(roomId)

    if (room) {
      room.removeMember(socket)
      socket.broadcast.to(room.id).emit('player-updated')
    }
  }

  createEstimation(socket: Socket, data: StartEstimation) {
    const room = this.app.findRoom(data.roomId)

    if (!room) {
      return
    }

    if (room.getPlayers().length === 0) {
      socket.emit('cannot-start-estimation', 'There is no players, please wait!')
      return
    }

    if (!room.startEstimation(socket)) {
      socket.emit('cannot-start-estimation', 'You cannot start an estimation now.')
    }

    let time = 10
    if (data.time > 2 && data.time < 61) {
      time = data.time
    }

    setTimeout(function() {
      const estimation = room.getEstimation()
      if (estimation) {
        estimation.close()
        socket.emit('estimation-ended')
        socket.broadcast.to(room.id).emit('estimation-ended')
      }
    }, time * 1000)
    socket.broadcast.to(room.id).emit('estimation-started', time)
  }

  estimate(socket: Socket, data: EstimateData) {
    const room = this.app.findRoom(data.roomId)
    if (room) {
      const estimation = room.getEstimation()

      if (estimation && !estimation.isDone()) {
        estimation.add(socket, data.value)
        socket.broadcast.to(room.id).emit('estimation-updated')
      }
    }
  }

  getEstimateResult(socket: Socket, roomId: string) {
    const room = this.app.findRoom(roomId)
    if (room) {
      const estimation = room.getEstimation()

      if (estimation) {
        socket.emit('get-estimation-result-response', estimation.getResult())
      }
    }
  }
}
