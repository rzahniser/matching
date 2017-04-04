// Messages to the server take the form:
//   <command><json>
// ... where <command> is a single letter, <json> is a JSON array,
// and multiple lines can be in the message, separated by \n's.
//
// Messages from the server are JSON arrays-of-arrays, where
// each array starts with a string command code.

var express = require('express'),
    path = require('path'),
    WebSocketServer = require('websocket').server,
    Game = require('./Game.js'),
    Protocol = require('./Protocol.js'),
    path = require('path');

var PORT = process.env.PORT || 3000;
var INDEX = path.join(__dirname, '../index.html');

var server = express()
  .use('/lib', express.static(path.join(__dirname, '../lib')))
  .use('/js', express.static(path.join(__dirname, '../js')))
  .use('/images', express.static(path.join(__dirname, '../images')))
  .use('/css', express.static(path.join(__dirname, '../css')))
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

var wsServer = new WebSocketServer({ httpServer: server });

wsServer.on('request', function(r) {
  var connection = r.accept(null, r.origin);
  var protocol;
  var game;
  
  console.log((new Date()) + ' Connection accepted.');
  
  function handle(command, data) {
    if(command == "E") {
      // Echo; don't bother to parse it.
      game.echo(data);
      console.log((new Date()) + ' Echo: ' + data);
      return;
    }
    console.log((new Date()) + ' Received ' + command + ": " + data);
    var params = JSON.parse(data);
    
    if(command == "N" || command == "J") {
      // Various ways to join a game
      protocol = Protocol.get(params[0]);
      game = (command == "N" ? protocol.joinPublicGame(params[1], params[2], params[3]) :
              // Note that params[2] might be undefined if this is hosting a new game
              protocol.joinPrivateGame(params[1], params[2]));
      game.connect(connection);
    } else if(command == "P") {
      game.addPlayer(params[0], connection);
    } else if(command == "B") {
      game.addBot();
    } else if(command == "I") {
      game.start();
    } else if(command == "D") {
      disconnect();
    } else if(command == "Z") {
      protocol.deleteGame(game);
    } else if(command == "R") {
      protocol = Protocol.get(params[0]);
      game = protocol.reconnect(connection, params[1], params[2], params[3]);
    } else {
      console.error("Unknown command: " + command);
    }
  }
  
  connection.on('message', function(message) {
    var data = message.utf8Data;
    for(var start = 0; start < data.length; ) {
      var i = data.indexOf("\n", start);
      if(i < 0) {
        i = data.length;
      }
      handle(data.charAt(start), data.substring(start + 1, i));
      start = i + 1;
    }
  });
    
  function disconnect() {
    console.log((new Date()) + ' Player disconnected.');
    if(game) {
      if(game.disconnect(connection)) {
        protocol.deleteGame(game);
      }
    }
  }
  
  connection.on('close', function(reasonCode, description) {
    disconnect();
  });
});