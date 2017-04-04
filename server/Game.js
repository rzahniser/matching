var Player = require('./Player.js');

var botNames = [ "Artoo", "Threepio", "Elvex", "Daneel", "Data", "Marvin" ];

function Game(id, playerLimit) {
  this.id = id;
  this.clients = [];
  this.log = [];
  this.players = [];
  this.playerLimit = playerLimit || 4;
};

Game.prototype.connect = function(client) {
  var message = "[" + JSON.stringify(["C", this.id, this.clients.length]);
  for(var i = 0; i < this.log.length; i++) {
    message += "," + this.log[i];
  }
  message += "]";
  this.clients.push(client);
  client.send(message);
};
Game.prototype.disconnect = function(client) {
  var hasAnyClient = false;
  for(var i = 0; i < this.clients.length; i++) {
    if(this.clients[i] === client) {
      this.clients[i] = null;
      this.echo(JSON.stringify(["D", i]));
      if(!this.started) {
        for(var j = this.players.length - 1; j >= 0; j--) {
          if(this.players[j].clientID == i) {
            this.players.splice(i, 1);
          }
        }
      }
    }
    hasAnyClient |= !!this.clients[i];
  }
  return !hasAnyClient;
};
Game.prototype.reconnect = function(client, oldClientID) {
  this.echo(JSON.stringify(["R", oldClientID, this.clients.length]));
  this.connect(client);
};
Game.prototype.addPlayer = function(name, client) {
  this.addPlayerMessage(new Player("P", this.getClientID(client), name));
};
Game.prototype.hasPlayer = function(name) {
  for(var i = 0; i < this.players.length; i++) {
    if(this.players[i].name == name) {
      return true;
    }
  }
  return false;
};
Game.prototype.addBot = function() {
  var name;
  do {
    name = botNames[(Math.random() * botNames.length) | 0];
  } while(this.hasPlayer(name));
  
  var clientID = 0;
  while(!this.clients[clientID]) {
    clientID++;
  }
  
  this.addPlayerMessage(new Player("B", clientID, name));
};
Game.prototype.init = function() {
  this.seed = (Math.random() * 1000000) | 0;
  return JSON.stringify(["I", this.seed]);
};
Game.prototype.addPlayerMessage = function(player) {
  if(this.started) {
    return;
  }
  var sending = player.getMessage();
  this.players.push(player);
  if(this.players.length == this.playerLimit) {
    sending += "," + this.init();
    this.started = true;
  }
  this.echo(sending);
};
Game.prototype.echo = function(message) {
  this.log.push(message);
  for(var i = 0; i < this.clients.length; i++) {
    if(this.clients[i]) {
      this.clients[i].send("[" + message + "]");
    }
  }
};
Game.prototype.start = function() {
  this.echo(this.init());
  this.started = true;
};
Game.prototype.getClientID = function(client) {
  for(var i = 0; i < this.clients.length; i++) {
    if(this.clients[i] === client) {
      return i;
    }
  }
  return this.clients.length;
};
Game.randomID = function() {
  id = "";
  for(var i = 0; i < 8; i++) {
    var a = (Math.random() * 34) | 0;
    id += String.fromCharCode(a < 26 ? 
                              "A".charCodeAt(0) + a :
                              "2".charCodeAt(0) + a - 26);
  }
  return id;
};

module.exports = Game;