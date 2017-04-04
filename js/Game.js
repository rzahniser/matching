/**
 * Game contains and displays the cards. It knows whose turn it is, and posts
 * events when the active player changes. It has a function to flip a card.
 */
define(["Random", "Images", "Card", "Player", "Bot"], function(Random, Images, Card, Player, Bot) {
  // 2D array of all the Cards, as [x][y].
  var cards = [];
  // Card already flipped up, if any
  var firstCard, secondCard;
  
  // Timeout ID for the resolve function
  var resolveTimeout;
  
  // Non-public game data
  var player;
  var players = [];
  var disconnect = [];
  var reconnect = [];
  
  function isMatch() {
    return firstCard.getImage() == secondCard.getImage();
  }
  
  function postPlayer() {
    if(Game.getPlayer()) {
      document.dispatchEvent(new CustomEvent("player", { detail: Game.getPlayer() }));
    }
  }
  
  function resolve() {
    if(isMatch()) {
      doMatch();
    } else {
      doMismatch();
    }
    resolveTimeout = undefined;
    firstCard = secondCard = undefined;
    postPlayer();
  }
  
  function doMatch() {
    firstCard.collect(players[player]);
    secondCard.collect(players[player]);
    Game.bot.remove(firstCard);
    Game.bot.remove(secondCard);
    players[player].score++;
  }
  
  function nextPlayer() {
    do {
      if(++player >= players.length) {
        player = 0;
        Game.round++;
      }
    } while(disconnect[players[player].clientID]);
    
    players[player].select();
  }
  
  function doMismatch() {
    firstCard.flip(false);
    secondCard.flip(false);
  }
  
  function gameIsStarted() {
    return player !== undefined;
  }
  
  var Game = {
    round: 0,
    columns: 6,
    rows: 5,
    getPlayer: function() {
      return (!resolveTimeout || this.isSolitaire()) && gameIsStarted() && !this.isGameOver()
        ? players[player] : undefined;
    },
    hasPlayer: function(name) {
      for(var i = 0; i < players.length; i++) {
        if(players[i].getName() == name) {
          return true;
        }
      }
      return false;
    },
    getPlayerCount: function() {
      var count = 0;
      for(var i = 0; i < players.length; i++) {
        if(!disconnect[players[i].clientID]) {
          count++;
        }
      }
      return count;
    },
    addPlayer: function(name, clientID, isBot) {
      if(!gameIsStarted()) {
        players.push(new Player(name, clientID, isBot));
      }
    },
    disconnect: function(clientID) {
      disconnect[clientID] = true;
      for(var i = players.length - 1; i >= 0; i--) {
        var p = players[i];
        if(p.isBot) {
          while(disconnect[p.clientID]) {
            p.clientID++;
          }
        } else if(p.clientID == clientID) {
          if(reconnect[clientID]) {
            // Don't actually disconnect, just hand over control
            // Could happen if the client reconnected before we
            // realized that it was gone.
            p.clientID = reconnect[clientID];
          } else if(gameIsStarted()) {
            p.disconnect();
          } else {
            p.remove();
            players.splice(i, 1);
          }
        }
      }
      if(!reconnect[clientID] && gameIsStarted()) {
        if(players[player].disconnected) {
          nextPlayer();
        }
        postPlayer();
      }
    },
    reconnect: function(oldClientID, newClientID) {
      if(!disconnect[oldClientID]) {
        // Do nothing until the original client disconnects; someone else
        // may be trying to hijack control.
        reconnect[oldClientID] = newClientID;
        return;
      }
      for(var i = players.length - 1; i >= 0; i--) {
        var p = players[i];
        if(p.clientID == oldClientID) {
          p.clientID = newClientID;
          p.reconnect();
        }
      }
    },
    getRemainingCount: function() {
      var remaining = this.columns * this.rows / 2;
      for(var i = 0; i < players.length; i++) {
        remaining -= players[i].score;
      }
      return remaining;
    },
    isGameOver: function() {
      var remaining = this.getRemainingCount();
      return remaining <= (secondCard && isMatch() ? 1 : 0);
    },
    isSolitaire: function() {
      return this.getPlayerCount();
    },
    getWinner: function() {
      var best = [ players[0] ];
      for(var i = 1; i < players.length; i++) {
        if(players[i].score == best[0].score) {
          best.push(players[i]);
        } else if(players[i].score > best[0].score) {
          best = [ players[i] ];
        }
      }
      return best;
    },
    initOffline: function() {
      this.clear();
      this.addPlayer("Player 1", 0, false);
      this.addPlayer("Player 2", 0, true);
      this.init((Math.random() * 1000000) | 0);
    },
    init: function(seed) {
      this.round = 1;
      var rand = new Random(seed);
      var order = Images.select(rand, this.columns * this.rows);
      
      for(var x = 0, i = 0; x < this.columns; x++) {
        cards[x] = [];
      }
      for(var y = 0, i = 0; y < this.rows; y++) {
        for(var x = 0; x < this.columns; x++, i++) {
          cards[x][y] = new Card(x, y, order[i], i);
        }
      }
      
      this.bot = new Bot(this);
      
      player = rand.nextInt(players.length);
      players[player].select();
      postPlayer();
    },
    clear: function() {
      cards = [];
      players = [];
      disconnect = [];
      reconnect = [];
      document.getElementById("sidebar").innerHTML = "";
      var main = document.getElementById("main");
      for(var i = main.children.length - 1; i >= 0; i--) {
        var id = main.children[i].getAttribute("id");
        if(id != "sidebar" && id != "dialog") {
          main.removeChild(main.children[i]);
        }
      }
    },
    getMouseCard: function(event) {
      var pos = Card.pageToGrid(event.pageX, event.pageY);
      return pos ? this.getCard(pos.x, pos.y) : undefined;
    },
    getCard: function(x, y) {
      return x < 0 || x >= this.columns ? undefined : cards[x][y];
    },
    flip: function(card) {
      if(secondCard) {
        // Still viewing the last pair. This should only be called if this
        // is generated by a network event, or the game is in solitaire mode.
        window.clearTimeout(resolveTimeout);
        resolveTimeout = undefined;
        resolve();
      }
      card.flip(true);
      this.bot.observe(this, card);
      if(firstCard) {
        secondCard = card;
        if(!isMatch()) {
          // Need to go to the next player now because this may be part of
          // the initial playback sequence, with players disconnecting and
          // reconnecting, and we need to decide the next player based on
          // the connection state at that point in the stream, not later
          // after the timeout expires.
          nextPlayer();
        }
        resolveTimeout = window.setTimeout(resolve, isMatch() ? 500 : 2000);
      } else {
        firstCard = card;
      }
    },
  };
  
  return Game;
});