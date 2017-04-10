define(["Game", "Socket", "Link", "Dialog", "JoinDialog", "HostDialog", "EndDialog"], function(Game, Socket, Link, Dialog, JoinDialog, HostDialog, EndDialog) {
  // My client index within the current game
  var myClientID = 0;
  // If true, the page was just refreshed and we were trying to reconnect
  var wasTryingReconnect;
  
  function doFlip(card) {
    Game.flip(card);
    if(Game.isGameOver()) {
      EndDialog.show();
    }
  }
  
  function doLocalFlip(card) {
    doFlip(card);
    Socket.send("E", ["F", myClientID, card.x, card.y]);
    if(Game.isGameOver()) {
      Socket.endGame();
    }
  }
  
  function mousePress(e) {
    var player = Game.getPlayer();
    if(player && player.clientID == myClientID && !player.isBot) {
      var card = Game.getMouseCard(e);
      if(card) {
        doLocalFlip(card);
      }
    }
  }
  
  var handlers = {
    C: function(gameID, clientID) {
      myClientID = clientID;
      Link.setGameID(gameID);
    },
    P: function(clientID, name) {
      Game.addPlayer(name, clientID, false);
      console.log("Added player: " + name + " (" + clientID + ")");
    },
    B: function(clientID, name) {
      Game.addPlayer(name, clientID, true);
    },
    R: function(clientID, newClientID) {
      Game.reconnect(clientID, newClientID);
    },
    I: function(seed) {
      Game.init(seed);
      window.localStorage["gameID"] = Link.getGameID();
      window.localStorage["clientID"] = myClientID;
      window.localStorage["seed"] = seed;
    },
    F: function(clientID, x, y) {
      if(clientID != myClientID) {
        // Local flips are handled by mouse handler already
        doFlip(Game.getCard(x, y));
      }
    },
    D: function(clientID) {
      Game.disconnect(clientID);
    },
    Z: function() {
      delete window.localStorage["gameID"];
      delete window.localStorage["clientID"];
      delete window.localStorage["seed"];
      if(wasTryingReconnect) {
        wasTryingReconnect = false;
        doNetworkInit();
      }
    },
  };
  document.getElementById("main").addEventListener("click", mousePress);

  Socket.setParameters({
    protocol: "memory",
    maxPlayers: 4,
    publicPlayers: 2,
    botTimeout: 15,
  });
  
  function hideConnectDialog() {
    document.getElementById("connect").setAttribute("style", "display: none");
  }
  
  function doNetworkInit() {
    hideConnectDialog();
    if(Link.getGameID()) {
      Socket.joinGame(Link.getGameID());
      HostDialog.show();
    } else {
      JoinDialog.show();
    }
  }

  var server = "$SERVER$";
  if(server.substring(0, 2) != "ws") {
    server = location.origin.replace(/^http/, 'ws');
  }
  Socket.init(server, function(command, data) {
    handlers[command].apply(null, data);
  }, function() {
    if(window.localStorage["gameID"]) {
      wasTryingReconnect = true;
      Socket.reconnect(window.localStorage["gameID"], 
                       window.localStorage["seed"],
                       window.localStorage["clientID"]);
    } else {
      doNetworkInit();
    }
  }, function() {
    hideConnectDialog();
    delete Socket.gameType;
    myClientID = 0;
    Game.initOffline();
  });

  document.addEventListener("player", function(e) {
    if(e.detail.isBot && e.detail.clientID == myClientID) {
      var botPlay = Game.bot.play(Game);
      window.setTimeout(function() {
        doLocalFlip(botPlay[0]);
      }, botPlay[1]);
      window.setTimeout(function() {
        doLocalFlip(botPlay[2]);
      }, botPlay[1] + botPlay[3]);
    }
  });
});