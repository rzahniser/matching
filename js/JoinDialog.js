/**
 * JoinDialog is the default startup dialog, used for joining
 * a public game.
 */
define(["Dialog", "Socket", "WaitDialog"], function(Dialog, Socket, WaitDialog) {
  var JoinDialog = new Dialog();

  var form = document.createElement("form");

  var playerName = JoinDialog.labeledField("Choose a name:", form);
  JoinDialog.button("Start", function() {
    if(!playerName.value) {
      playerName.focus();
      return;
    }
    JoinDialog.hide();
    Socket.playPublic(playerName.value);
    Dialog.show("WaitDialog");
  }, playerName.parentElement, true);

  JoinDialog.dialog.appendChild(form);

  JoinDialog.link("Host private game", function() {
    JoinDialog.hide();
    Socket.hostGame();
    Dialog.show("HostDialog", playerName.value);
  }, JoinDialog.dialog);
  
  JoinDialog.onShow = function(name) {
    if(name !== undefined) {
      playerName.value = name;
    }
    playerName.focus();
  };
  
  return JoinDialog;
});