var shell = require('shelljs');
var requirejs = require('requirejs');

var herokuInfo = shell.exec("heroku info -s", {silent:true}).stdout;
var appname = /web_url=https?:\/\/([^\/]+)\//.exec(herokuInfo)[1];

shell.rm("-rf", "dist");

shell.mkdir("dist");

shell.cp("-R", "images", "dist");
shell.cp("-R", "lib", "dist");
shell.cp("*.html", "dist");

// Collapse all modules into one minified file
requirejs.optimize({
  baseUrl: "js",
  name: "init",
  include: "main",
  out: "dist/main.js",
  onBuildWrite: function (moduleName, path, contents) {
    if(appname) {
      contents = contents.replace("$SERVER$", "wss://" + appname);
    }
    return contents;
  }
});

// Point require.js at the minified file
shell.sed("-i", "js/config", "main.js", "dist/index.html");

// Do the same for CSS
requirejs.optimize({
  cssIn: "css/main.css",
  out: "dist/main.css"
})
shell.sed("-i", "css/main.css", "main.css", "dist/index.html");