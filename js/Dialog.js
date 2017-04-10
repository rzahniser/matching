define(["Socket"], function(Socket) {
  var fadeOut = "animation: dialogFadeOut 0.5s",
      fadeIn = "animation: dialogFadeIn 0.5s",
      hidden = "display: none";
  
  function checkAndSet(dialog, from, to) {
    var style = dialog.getAttribute("style");
    if(style == from || style == undefined) {
      dialog.setAttribute("style", to);
      return true;
    }
    return false;
  }
  
  function Dialog(peer) {
    if(peer) {
      this.dialog = peer;
    } else {
      this.dialog = document.createElement("div");
      this.dialog.setAttribute("style", hidden);
      document.getElementById("dialog").appendChild(this.dialog);
    }
  }
  Dialog.prototype.show = function() {
    if(checkAndSet(this.dialog, hidden, fadeIn) && 
        typeof this.onShow == 'function') {
      this.onShow.apply(this, arguments);
    }
  };
  Dialog.prototype.isShowing = function() {
    return this.dialog.getAttribute("style") == fadeIn;
  };
  Dialog.prototype.hide = function() {
    if(checkAndSet(this.dialog, fadeIn, fadeOut)) {
      if(typeof this.onHide == 'function') {
        this.onHide.apply(this, arguments);
      }
      var args = [].slice.apply(arguments);
      this.dialog.addEventListener("animationend", function remove() {
        this.dialog.removeEventListener("animationend", remove);
        if(checkAndSet(this.dialog, fadeOut, hidden) && 
            typeof this.onHidden == 'function') {
          this.onHidden.apply(this, args);
        }
      }.bind(this));
    }
  };
  
  // Just used for constructing the dialog:
  Dialog.prototype.labeledField = function(labelText, form) {
    var label = document.createElement("label");
    label.appendChild(document.createTextNode(labelText));
    label.appendChild(document.createElement("br"));
    
    var field = document.createElement("input");
    field.setAttribute("type", "text");
    label.appendChild(field);
    form.appendChild(label);
    field.addEventListener("focus", function() {
      field.select();
    });
    
    return field;
  };
  Dialog.prototype.button = function(text, callback, form, isSubmit) {
    var button = document.createElement("button");
    if(isSubmit) {
      button.setAttribute("type", "submit");
    }
    button.setAttribute("data-label", text);
    button.addEventListener("click", function(e) {
      if(this.isShowing()) {
        callback.call(this);
      }
      e.preventDefault();
    }.bind(this));
    form.appendChild(button);
    return button;
  };
  Dialog.prototype.link = function(text, callback, form) {
    var link = document.createElement("a");
    link.appendChild(document.createTextNode(text));
    link.setAttribute("href", "#");
    link.addEventListener("click", function(e) {
      if(this.isShowing()) {
        callback.call(this);
      }
      e.preventDefault();
    }.bind(this));
    form.appendChild(document.createElement("br"));
    form.appendChild(link);
    return link;
  };
  Dialog.show = function(name) {
    var args = [].slice.call(arguments, 1);
    require([name], function(dialog) { 
      dialog.show.apply(dialog, args);
    });
  };
  
  return Dialog;
});