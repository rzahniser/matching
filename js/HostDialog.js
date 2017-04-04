/**
 * HostDialog is the startup dialog for hosting (or joining) a private game.
 */
define(["Dialog", "Socket", "Link", "Game"], function(Dialog, Socket, Link, Game) {
  var HostDialog = new Dialog();
  
  var form = document.createElement("form");

  var playerName = HostDialog.labeledField("Add a local player:", form);
  HostDialog.button("Add", function() {
    if(playerName.value && !Game.hasPlayer(playerName.value)) {
      Socket.addPlayer(playerName.value);
    }
    playerName.focus();
  }, playerName.parentElement, true);
  
  form.appendChild(document.createElement("br"));
  form.appendChild(document.createElement("br"));

  // Set the link URL if available; then wait in case the game ID
  // changes. Link's game ID will be updated by the main "C" handler.
  var link = HostDialog.labeledField("... or invite a friend with the link below:", form);
  link.value = Link.getURL();
  link.setAttribute("size", "50");

  Socket.listen("C", function() {
    link.value = Link.getURL();
  }.bind(this))
  Socket.listen("I", HostDialog.hide.bind(HostDialog));

  form.appendChild(document.createElement("br"));
  form.appendChild(document.createElement("br"));

  var start = HostDialog.button("Start Game", function() {
    if(Game.getPlayerCount() > 0) {
      Socket.startGame();
    }
  }, form);

  HostDialog.dialog.appendChild(form);
  
  HostDialog.onShow = function(name) {
    if(name !== undefined) {
      playerName.value = name;
    }
    playerName.focus();
};
  
  HostDialog.link("Join public game", function() {
    HostDialog.hide();
    Socket.leaveGame();
    Dialog.show("JoinDialog", playerName.value);
  }, HostDialog.dialog);

  return HostDialog;
});