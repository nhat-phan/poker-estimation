import { Estimation } from './Estimation'
import { Socket } from 'socket.io'

export type Member = {
  socketId: string
  name: string
  role: 'host' | 'player' | 'creator'
}

export class Room {
  protected roomId: string
  protected members: Member[]
  protected estimation: Estimation

  constructor(host: Socket, roomId: string) {
    this.roomId = roomId
    this.members = []
    this.members.push({
      socketId: host.id,
      name: 'unknown',
      role: 'creator'
    })
  }

  get id(): string {
    return this.roomId
  }

  addMember(socket: Socket, name: string, role: 'host' | 'player') {
    this.members.push({
      socketId: socket.id,
      name: name,
      role: role
    })
  }

  removeMember(socket: Socket) {
    this.members = this.members.filter(i => i.socketId !== socket.id)
  }

  getCreator(): Member {
    return this.members.find(i => i.role === 'creator')!
  }

  getMembers(): Member[] {
    return this.members
  }

  getPlayers(): Member[] {
    return this.members.filter(i => i.role === 'player')
  }

  getHosts(): Member[] {
    return this.members.filter(i => i.role === 'host')
  }

  getEstimation(): Estimation | undefined {
    return this.estimation
  }

  startEstimation(socket: Socket): boolean {
    if (this.canStartEstimation(socket)) {
      this.estimation = new Estimation(this.getPlayers())
      return true
    }

    return false
  }

  canStartEstimation(socket: Socket): boolean {
    if (this.estimation && !this.estimation.isDone()) {
      return false
    }

    if (socket.id === this.getCreator().socketId) {
      return true
    }

    return !!this.getHosts().find(m => m.socketId === socket.id)
  }
}
