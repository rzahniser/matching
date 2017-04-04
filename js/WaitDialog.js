define(["Dialog", "Socket"], function(Dialog, Socket) {
  var WaitDialog = new Dialog();

  var label = document.createElement("label");
  label.appendChild(document.createTextNode("Waiting for an opponent..."));
  WaitDialog.dialog.appendChild(label);
  
  Socket.listen("I", WaitDialog.hide.bind(WaitDialog));
  
  return WaitDialog;
});