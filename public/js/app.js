$(document).ready(function() {
  var socket,
    ROOM_ID,
    PLAYING = false,
    ESTIMATION_TIME = 0

  $('#welcome').slideDown()

  $('#join-room-btn').click(function() {
    $('#welcome').slideUp()
    $('#join-room').slideDown()
  })

  $('#new-room-btn').click(function() {
    socket = io(window.SERVER_URL || location.href)

    socket.on('connect', function() {
      socket.emit('create-room')
    })

    socket.on('room-created', function(roomId) {
      $('#welcome').slideUp()
      $('#host').slideDown()
      $('#result').slideDown()
      ROOM_ID = roomId
      $('#room-id').text(roomId.substr(0, 3) + ' ' + roomId.substr(3, 3) + ' ' + roomId.substr(6))
      watch(socket)
    })

    socket.on('cannot-start-estimation', function(message) {
      alert(message)
    })

    $('#host .exit').click(function() {
      if (confirm('Are you sure?')) {
        socket.emit('close-room', ROOM_ID)
        PLAYING = false
        location.reload()
      }
    })

    $('#host .change-time').click(function() {
      const sender = $(this)
      $('#host .change-time')
        .removeClass('btn-warning')
        .addClass('btn-primary')
      sender.removeClass('btn-primary').addClass('btn-warning')
    })
    $('#host .start').click(function() {
      const value = parseInt($('#host .btn-warning').attr('value'))
      socket.emit('start-estimation', { roomId: ROOM_ID, time: value })
    })
  })

  $('#join-room form').submit(function(e) {
    e.preventDefault()
    const name = $('#player-name').val()
    const roomId = $('#player-room-id').val()
    socket = io(window.SERVER_URL || location.href)
    socket.on('connect', function() {
      socket.emit('join-room', { roomId, name })

      socket.on('joined', function(roomId) {
        ROOM_ID = roomId
        $('#join-room').slideUp()
        $('#result').slideDown()
        $('#player').slideDown()

        watch(socket)
        socket.emit('get-players', ROOM_ID)
      })

      socket.on('cannot-join', function() {
        $('#welcome, #host, #result, #player').hide()
        $('#join-room').show()
      })

      $('#player .player-list li').click(function() {
        const sender = $(this)
        const value = sender.attr('value')
        $('#player .player-list li').removeClass('chose')
        sender.addClass('chose')
        socket.emit('estimate', { roomId: ROOM_ID, value: value })
      })
    })
  })

  function watch(socket) {
    PLAYING = true

    socket.on('player-updated', function() {
      socket.emit('get-players', ROOM_ID)
    })

    socket.on('estimation-updated', function() {
      socket.emit('get-estimation-result', ROOM_ID)
    })

    socket.on('estimation-ended', function() {
      socket.emit('get-estimation-result', ROOM_ID)
    })

    socket.on('get-players-response', function(players) {
      $('#result .result-list li').addClass('inactive')
      for (const player of players) {
        display_player(player)
      }
      $('#result .result-list li.inactive').remove()
    })

    socket.on('estimation-started', function(second) {
      $('#player .player-list li')
        .removeClass('inactive chose')
        .addClass('active')
      start_estimate(second)
    })

    socket.on('get-estimation-result-response', function(result) {
      const values = Object.values(result)
      values.sort(compare_estimation_values)
      if (values.length === 0) {
        return
      }

      for (const id in result) {
        const item = $('#result .result-list li.player-' + id)
        item.removeClass('lowest highest inactive')
        if (item.length === 0) {
          continue
        }

        const number = item.find('.number')

        if (result[id] === null) {
          number.text('!')
          item.addClass('inactive')
          continue
        }

        number.text(result[id])

        if (result[id] === values[0]) {
          item.addClass('lowest')
        }

        if (result[id] === values[values.length - 1]) {
          item.addClass('highest')
        }
      }

      if (values[0] === values[values.length - 1]) {
        $('#result .result-list li.lowest').removeClass('lowest')
        $('#result .result-list li.highest').removeClass('highest')
      }
    })

    socket.on('disconnect', function() {
      PLAYING = false
      location.reload()
    })

    window.onbeforeunload = function() {
      if (PLAYING) {
        // return 'Please confirm that you want to leave a room?'
      }
    }

    $(window).on('unload', function() {
      socket.emit('bye', ROOM_ID)
    })
  }

  function start_estimate(second) {
    $('#result .result-list li .number').text('...')
    ESTIMATION_TIME = second
    $('#result h2')
      .text(`Estimation end in ${ESTIMATION_TIME}...`)
      .addClass('text-danger')

    const timer = setInterval(function() {
      ESTIMATION_TIME--
      if (ESTIMATION_TIME <= 0) {
        clearInterval(timer)
        $('#result h2')
          .removeClass('text-danger')
          .text('All Estimations')
      } else {
        $('#result h2').text(`Estimation end in ${ESTIMATION_TIME}...`)
      }
    }, 1000)
  }

  function display_player(player) {
    const existing = $('#result .result-list li.player-' + player.socketId)
    if (existing.length !== 0) {
      existing.removeClass('inactive')
      return
    }

    const li = $('<li />')
    li.append($('<span class="number">-</span>'))
    li.append($('<span class="name"></span>').text(player.name))
    li.addClass('player-' + player.socketId).appendTo('#result .result-list')
  }

  function compare_estimation_values(a, b) {
    if (a === b) {
      return 0
    }

    if (a === '-' && b !== '-') {
      return 1
    }

    if (a !== '-' && b === '-') {
      return -1
    }

    const numberA = parseInt(a)
    const numberB = parseInt(b)

    return numberA < numberB ? -1 : 1
  }
})
