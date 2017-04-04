function Player(type, clientID, name) {
  this.type = type;
  this.clientID = clientID;
  this.name = name;
}
Player.prototype.getMessage = function() {
  return JSON.stringify([this.type, this.clientID, this.name]);
};
module.exports = Player;