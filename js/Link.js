/**
 * Link represents the link to share to invite someone to
 * join this game. It is based on window.location, local
 * storage, and/or a game ID supplied by the server.
 */
define([], function() {
  var start, end, gameID;
  
  (function parse() {
    var url = window.location.href;
    var result = /[?&]gameID(?:=([^&#]*)|&|#|$)/.exec(url);
    if(result) {
      // URL already contains a game ID parameter
      start = url.substring(0, result.index + 1) + "gameID=";
      gameID = decodeURIComponent(result[1]);
      end = url.substring(result.index + (result[1] ? result[0].length : 7));
    } else {
      var i = url.indexOf("?");
      var j = url.indexOf("#");
      if(i >= 0 && (j < 0 || i < j)) {
        // URL has query parameters, but not gameID
        start = url.substring(0, i + 1) + "gameID=";
        end = (i == j - 1 || i == url.length - 1 ? "" : "&") + url.substring(i + 1);
      } else if(j >= 0) {
        // URL has a hash, but no query parameters
        start = url.substring(0, j) + "?gameID=";
        end = url.substring(j);
      } else {
        start = url + "?gameID=";
        end = "";
      }
    }
  })();
  
  return {
    getGameID: function() {
      return gameID;
    },
    setGameID: function(newGameID) {
      gameID = newGameID;
    },
    getURL: function() {
      return gameID ? start + encodeURIComponent(gameID) + end : "";
    },
  };
});