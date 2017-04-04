/**
 * Player represents a player, and manages the DOM peer.
 */
define(["Vector"], function(Vector) {
  // Tile height of the player divs (plus spacing)
  var playerY = 170;
  // Offset from the top of the player div to the center left of the cards
  var cardLeft = 10, cardTop = 90;
  // Offset per card
  var cardX = 5;
  
  var playerCount = 0;
  
  function Player(name, clientID, isBot) {
    this.clientID = clientID;
    this.isBot = isBot;
    this.score = 0;
    this.peer = document.createElement("div");
    this.peer.classList.add("player");
    this.peer.setAttribute("data-name", name);
    this.peer.setAttribute("style", "color: hsl(" + 
                     (((playerCount++ * 222.5) % 360) | 0) + ",100%,75%);");
    document.getElementById("sidebar").appendChild(this.peer);
  }
  
  /**
   * Get the (x, y) position where the next card should
   * be collected to (center of left edge).
   */
  Player.prototype.getNextCardPosition = function() {
    return new Vector(
        cardLeft + this.score * cardX, 
        this.peer.offsetTop + cardTop);
  };
  /**
   * Update the selector to bracket this player, creating it if necessary.
   */
  Player.prototype.select = function() {
    var selector = document.getElementById("playerSelector");
    if(!selector) {
      selector = document.createElement("div");
      selector.setAttribute("id", "playerSelector");
      document.getElementById("main").appendChild(selector);
    }
    selector.setAttribute("style", "top: " + this.peer.offsetTop + "px;");
  };
  /**
   * Disconnect a player, but leave the player visible
   */
  Player.prototype.disconnect = function() {
    this.peer.classList.add("disconnected");
    this.disconnected = true;
  };
  /**
   * Reconnect a player, assigning a new client ID
   */
  Player.prototype.reconnect = function() {
    this.peer.classList.remove("disconnected");
    delete this.disconnected;
  };
  /**
   * Remove a player.
   */
  Player.prototype.remove = function() {
    this.peer.parentElement.removeChild(this.peer);
  };
  /**
   * Get this player's name
   */
  Player.prototype.getName = function() {
    return this.peer.getAttribute("data-name");
  };
  
  return Player;
})