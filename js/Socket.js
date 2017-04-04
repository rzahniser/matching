/**
 * Socket represents the server connection. If connected to a game,
 * it has a client ID and a game ID.
 */
define([], function() {
  var ws;
  var parameters = {
    protocol: "game",
    maxPlayers: 2,
    publicPlayers: 2,
    botTimeout: 0
  };
  // Message queued up to send after the current event. This makes
  // it possible to send multiple messages in one event without the
  // calling code knowing that it needs to coordinate.
  var message = "";
  
  function doSend() {
    var sendingMessage = message;
    isPending = false;
    message = "";
    if(ws && ws.readyState == ws.OPEN) {
      ws.send(sendingMessage);
    }
  }
  // Callbacks to notify on particular commands
  var callbacks = {};
  
  function notifyCallbacks(command) {
    var list = callbacks[command];
    if(list) {
      for(i = 0; i < list.length; i++) {
        list[i]();
      }
    }
  }
  
  return {
    send: function(command, data) {
      // This should only be called after init(), so ws is defined
      if(ws.readyState != ws.OPEN && ws.readyState != ws.CONNECTING) {
        // Connection has failed somehow
        return this;
      }
      if(message.length) {
        message += "\n";
      } else if(ws.readyState == ws.CONNECTING) {
        // Schedule this message when the socket opens
        ws.addEventListener("open", doSend);
      } else {
        // Schedule this message after the current event
        window.setTimeout(doSend);
      }
      message += command + JSON.stringify(data);
      return this;
    },
    setParameters: function(params) {
      for(var k in params) {
        parameters[k] = params[k];
      }
      return this;
    },
    joinGame: function(gameID) {
      this.gameType = "J";
      this.send("J", [ 
        parameters.protocol, 
        parameters.maxPlayers,
        gameID
      ]);
      return this;
    },
    hostGame: function() {
      this.gameType = "J";
      this.send("J", [ 
        parameters.protocol, 
        parameters.maxPlayers
      ]);
      return this;
    },
    addPlayer: function(name) {
      this.send("P", [
        name
      ]);
      return this;
    },
    startGame: function() {
      this.send("I", []);
      return this;
    },
    endGame: function() {
      this.send("Z", []);
      return this;
    },
    playPublic: function(name) {
      this.gameType = "N";
      this.send("N", [ 
        parameters.protocol, 
        name, 
        parameters.publicPlayers, 
        parameters.botTimeout,
      ]);
      return this;
    },
    leaveGame: function() {
      this.send("D", []);
      return this;
    },
    reconnect: function(gameID, seed, clientID) {
      this.send("R", [ parameters.protocol, gameID, seed, clientID ]);
    },
    listen: function(command, callback) {
      if(callbacks[command]) {
        callbacks[command].push(callback);
      } else {
        callbacks[command] = [ callback ];
      }
      return this;
    },
    init: function(url, message, open, error, close) {
      ws = new WebSocket(url);
      ws.addEventListener("message", function(e) {
        console.log("Received: " + e.data);
        var msg = JSON.parse(e.data);
        for(var i = 0; i < msg.length; i++) {
          message(msg[i][0], msg[i].slice(1));
          notifyCallbacks(msg[i][0]);
        }
      });
      if(open) {
        ws.addEventListener("open", open);
      }
      if(error) {
        ws.addEventListener("error", error);
      }
      if(close) {
        ws.addEventListener("close", close);
      }
      return this;
    },
  };
});