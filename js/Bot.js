/**
 * Bot accumulates knowledge about the game state and tries to
 * play in a believable human fashion, with occasional mistakes
 * on cards that haven't been seen in a while.
 */
define([], function() {
  function Bot(game) {
    this.knowledge = [];
    for(var x = 0; x < game.columns; x++) {
      this.knowledge[x] = [];
      for(var y = 0; y < game.rows; y++) {
        this.knowledge[x][y] = 0;
      }
    }
    this.seen = {};
    this.tryNext = [];
    this.total = 0;
  }
  Bot.prototype.testMemory = function(x, y, tries) {
    return Math.random() < this.knowledge[x][y] ||
      (tries > 1 && this.testMemory(x, y, tries - 1));
  };
  // Called when a card has been flipped
  Bot.prototype.observe = function(game, card) {
    var change = 1 - this.knowledge[card.x][card.y];
    // Attenuate existing knowledge as the new knowledge crowds it out
    // of working memory
    var attenuation = (1 - change * 0.003 * this.total * this.total);
    for(var x = 0; x < game.columns; x++) {
      for(var y = 0; y < game.rows; y++) {
        this.knowledge[x][y] *= attenuation;
      }
    }
    var match = this.seen[card.getImage()];
    if(match === card) {
      // Already saw this one
    } else if(match) {
      // Getting excited about this card!
      this.tryNext.splice(0, 0, card);
    } else {
      this.seen[card.getImage()] = card;
    }
    this.total = (this.total * attenuation) + change;
    this.knowledge[card.x][card.y] = 1;
  };
  // Called when a card has been collected
  Bot.prototype.remove = function(card) {
    for(var i = this.tryNext.length; i >= 0; i--) {
      if(this.tryNext[i] === card) {
        this.tryNext.splice(i, 1);
      }
    }
    this.total -= this.knowledge[card.x][card.y];
  };
  // It is your turn -- make a play
  Bot.prototype.play = function(game) {
    var play = [];
    var time = [ 800 + Math.random() * 500, 800 + Math.random() * 500 ];
    var available = [];
    // Default play is to take the next two unknown cards
    for(var y = 0; y < game.rows; y++) {
      for(var x = 0; x < game.columns; x++) {
        var c = game.getCard(x, y);
        if(!c.isFlipped()) {
          available.push(c);
          if(this.knowledge[x][y] == 0 && play.length < 2) {
            play.push(c);
          }
        }
      }
    }
    // If there are no more unknown cards, pick two randomly
    if(play.length < 2) {
      var i = (Math.random() * available.length) | 0;
      var j = (Math.random() * (available.length - 1)) | 0;
      play.push(available[i], available[j >= i ? j + 1 : j]);
    }
    // If we know about a match, try to find it.
    for(var i = 0; i < this.tryNext.length; i++) {
      var c = this.tryNext[i];
      var match = this.seen[c.getImage()];
      if(c != play[0] && this.testMemory(match.x, match.y, 2)) {
        play = [ c, play[0] ];
        time = [ 200 + Math.random() * 300, time[0] ];
        break;
      }
    }
    // If the first card played has a match that we know about,
    // try to flip the match.
    var match = this.seen[play[0].getImage()];
    if(match && match != play[0]) {
      play[1] = match;
      time[1] = time[0] + 5000 * (1 - this.knowledge[match.x][match.y]) 
            // Speed up as the game progresses, since it's easier to remember
            * game.getRemainingCount() / (game.rows * game.columns / 2);
      if(!this.testMemory(match.x, match.y)) {
        // We don't have a perfect memory; randomly choose one nearby if possible.
        for(var i = 0; i < 10; i++) {
          var c = game.getCard(match.x + ((Math.random() * 3) | 0) - 1,
                               match.y + ((Math.random() * 3) | 0) - 1);
          // Don't flip a card we've never seen, and don't flip one we remember well
          if(c && c != play[0] && !c.isFlipped() && this.knowledge[c.x, c.y] &&
             !(this.testMemory(c.x, c.y) && this.testMemory(c.x, c.y))) {
            play[1] = c;
            break;
          }
        }
      }
    }
    return [ play[0], time[0], play[1], time[1] ];
  };
  
  return Bot;
});