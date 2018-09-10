import * as Express from 'express'
import * as SocketIO from 'socket.io'
import * as Http from 'http'
import * as Path from 'path'
import { PokerEstimation } from './lib/PokerEstimation'

const port = process.env.PORT || 8080

const express = Express()

express.use(Express.static(Path.resolve(__dirname, '../public')))

const server = Http.createServer(express)
const io = SocketIO(server)

server.listen(port, function() {
  console.info('Listening to port ' + port)
})

const app = new PokerEstimation(io)
io.on('connection', function(socket) {
  socket.on('create-room', function() {
    app.createRoom(socket)
  })

  socket.on('join-room', function(data: { roomId: string; name: string }) {
    app.joinRoom(socket, data)
  })

  socket.on('get-players', function(roomId) {
    app.getPlayers(socket, roomId)
  })

  socket.on('close-room', function(roomId) {
    app.closeRoom(socket, roomId)
  })

  socket.on('bye', function(roomId) {
    app.memberLeave(socket, roomId)
  })

  socket.on('start-estimation', function(data: { roomId: string; time: number }) {
    app.createEstimation(socket, data)
  })

  socket.on('estimate', function(data: { roomId: string; value: string }) {
    app.estimate(socket, data)
  })

  socket.on('get-estimation-result', function(roomId: string) {
    app.getEstimateResult(socket, roomId)
  })
})
