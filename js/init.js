define([], function() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
  if(document.readyState === "complete") {
    init();
  } else {
    document.addEventListener('readystatechange', function() {
      if(document.readyState === "complete") {
        init();
      }
    }, false);
  }
  
  function init() {
    require(["main"]);
  }
});