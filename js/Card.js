/**
 * Card defines the state and position of a card, manages the DOM peer,
 * and has a static method to convert screen coordinates into grid coordinates.
 */
define(["Vector"], function(Vector) {
  // Various layout constants
  var tileLeft = 230, tileWidth = 120, tileX = tileWidth + 10;
  var tileTop = 25, tileHeight = 120, tileY = tileHeight + 10;
  
  function Card(x, y, image, n) {
    this.x = x;
    this.y = y;
    this.peer = document.createElement("div");
    this.peer.classList.add("card");
    this.peer.setAttribute("data-image", image.name);
    this.peer.setAttribute("data-description", image.description);
    this.peer.setAttribute("style", 
        "left: " + getPageX(x) + "; " +
        "top: " + getPageY(y) + "; " +
        "background-image: url(images/" + (image.image || image.name) + ".jpg); " +
                      " animation-delay: " + (-3 + n * 0.05).toFixed(2) + "s;");
    document.getElementById("main").appendChild(this.peer);
  }
  
  /**
   * Flip this card up or down
   */
  Card.prototype.flip = function(up) {
    if(up) {
      this.peer.classList.add("flipped");
    } else {
      this.peer.classList.remove("flipped");
    }
  };
  /**
   * Is this card currently flipped?
   */
  Card.prototype.isFlipped = function() {
    return this.peer.classList.contains("flipped");
  };
  /**
   * Collect this card (moving it so that its left edge is centered
   * on the next card location for the given player).
   */
  Card.prototype.collect = function(player) {
    var pos = player.getNextCardPosition();
    this.peer.setAttribute("style", this.peer.getAttribute("style") +
                      "left: " + pos.x + "px; " +
                      "top: " + (pos.y - 0.5 * tileHeight) + "px; " +
                      "z-index: " + (player.score + 1));
    this.peer.classList.add("collected");
  };
  /**
   * Get the name of the image on this card.
   */
  Card.prototype.getImage = function() {
    return this.peer.getAttribute("data-image");
  };
  /**
   * Move the selector to bracket the grid location of this card,
   * and update the ARIA data of the selector to reflect what is
   * visible (the image name if flipped, "empty" if collected, 
   * and otherwise just the (x, y) location).
   */
  Card.prototype.select = function() {
    // TODO
  };
  
  // Get the page position of the top left of a card
  function getPageX(x) {
    return tileLeft + tileX * x;
  }
  function getPageY(y) {
    return tileTop + tileY * y;
  }
  
  /**
   * Convert a pixel (pageX, pageY) location to a grid location.
   */
  Card.pageToGrid = function(pageX, pageY) {
    for(var elem = document.getElementById("main"); elem; elem = elem.offsetParent) {
      pageX -= elem.offsetLeft;
      pageY -= elem.offsetTop;
    }

    if(pageX < tileLeft || pageX >= tileLeft + tileX * this.columns || 
        pageY < tileTop || pageY >= tileTop + tileY * this.rows || 
        (pageX - tileLeft) % tileX >= tileWidth || 
        (pageY - tileTop) % tileY >= tileHeight) {
      // Not in the play area, or in the space between cards
      return undefined;
    }
    return new Vector(
      ((pageX - tileLeft) / tileX) | 0, 
      ((pageY - tileTop) / tileY) | 0);
  };
  
  return Card;
});