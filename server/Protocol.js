var Game = require('./Game.js');

var protocols = {};

function Protocol(protocol) {
  this.protocol = protocol;
  this.games = {};
}
Protocol.prototype.generateID = function() {
  var id;
  do {
    id = Game.randomID();
  } while(this.games[id]);
  return id;
};
Protocol.prototype.checkGameStart = function() {
  if(this.currentGame.started) {
    console.log((new Date()) + ' Started ' + this.protocol + ' game ' + this.currentGame.id);
    this.currentGame = undefined;
    if(this.botTimeout) {
      clearTimeout(this.botTimeout);
    }
  }
};
Protocol.prototype.joinPrivateGame = function(playerLimit, gameID) {
  if(!gameID) {
    gameID = this.generateID();
  }
  var game = this.games[gameID];
  if(!game) {
    game = this.games[gameID] = new Game(gameID, playerLimit);
    console.log((new Date()) + ' Created ' + this.protocol + ' game ' + game.id);
  }
  return game;
};
Protocol.prototype.joinPublicGame = function(playerName, playerLimit, botTime) {
  if(!this.currentGame) {
    this.currentGame = new Game(this.generateID(), playerLimit);
    this.games[this.currentGame.id] = this.currentGame;
    console.log((new Date()) + ' Created ' + this.protocol + ' game ' + this.currentGame.id);
    if(botTime) {
      this.botTimeout = setInterval(function() {
        this.currentGame.addBot();
        this.checkGameStart();
      }.bind(this), 1000 * botTime);
    }
  }
  var game = this.currentGame;
  game.addPlayer(playerName);
  this.checkGameStart();
  console.log((new Date()) + ' Added player to ' + this.protocol + ' game ' + game.id);
  return game;
};
Protocol.prototype.reconnect = function(client, gameID, seed, clientID) {
  var game = this.games[gameID];
  if(game && game.seed == seed) {
    // Always permit reconnect; the client will take care of not handing over control
    // until the previous client has clearly disconnected.
    game.reconnect(client, clientID);
    return game;
  } else {
    client.send(JSON.stringify([["Z"]]));
    return null;
  }
};
Protocol.prototype.deleteGame = function(game) {
  delete this.games[game.id];
};
Protocol.get = function(id) {
  var protocol = protocols[id];
  if(!protocol) {
    protocol = protocols[id] = new Protocol(id);
  }
  return protocol;
};

module.exports = Protocol;