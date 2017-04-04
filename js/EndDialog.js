/**
 * EndDialog is shown when a player wins
 */
define(["Dialog", "Socket", "Game", "Link"], function(Dialog, Socket, Game, Link) {
  var EndDialog = new Dialog();

  var label = document.createElement("label");
  EndDialog.dialog.appendChild(label);
  EndDialog.dialog.appendChild(document.createElement("br"));
  
  var button = EndDialog.button("OK", function() {
    EndDialog.hide();
    Game.clear();
    if(Socket.gameType == "N") {
      Dialog.show("JoinDialog");
    } else if(Socket.gameType == "J") {
      Socket.joinGame(Link.getGameID());
      Dialog.show("HostDialog");
    } else {
      Game.initOffline();
    }
  }, EndDialog.dialog);
  
  EndDialog.onShow = function() {
    var winner = Game.getWinner();
    var text;
    if(Game.isSolitaire()) {
      text = "Completed in " + Game.round + " turns.";
    } else if(winner.length == 1) {
      text = "Winner: " + winner[0].getName();
    } else {
      text = "Tie: " + winner[0].getName();
      for(var i = 1; i < winner.length; i++) {
        text += ", " + winner[i].getName();
      }
    }
    label.innerHTML = text;
    button.focus();
  };
  
  return EndDialog;
});