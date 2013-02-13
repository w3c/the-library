
var fs = require("fs")
,   pth = require("path")
,   couth = require("couth")
,   localConfigPath = pth.join(__dirname, "local-config.json")
;

var app = couth();

// load local dev settings, if any
if (fs.existsSync(localConfigPath)) {
    var local = require(localConfigPath);
    app.dev();
    if (local.deployTo) app.deployTo(local.deployTo);
    if (local.port) app.port(local.port);
    if (local.vhost) app.vhost(local.vhost);
    if (local.auth) app.auth(local.auth);
}

// production settings
app
    .prod()
        .deployTo("https://deploy.library.w3c-test.org/")
        .vhost("library.w3c-test.org")
;

// universal settings
app
    .all()
        .db("w3clibrary")
        .index("/index.html")
;

// load statics
var statPath = pth.join(__dirname, "static");
app.addStatics([
        { path: "/index.html",          content: pth.join(statPath, "index.html") }
    ,   { path: "/js/angular.min.js",   content: pth.join(statPath, "js/angular.min.js") }
    ,   { path: "/js/jquery.min.js",    content: pth.join(statPath, "js/jquery.min.js") }
    ,   { path: "/bootstrap/js/bootstrap.min.js"
        , content: pth.join(statPath, "bootstrap/js/bootstrap.min.js") }
    ,   { path: "/bootstrap/css/bootstrap.min.css"
        , content: pth.join(statPath, "bootstrap/css/bootstrap.min.css") }
    ,   { path: "/bootstrap/css/bootstrap-responsive.min.css"
        , content: pth.join(statPath, "bootstrap/css/bootstrap-responsive.min.css") }
]);

// process CLI and run
app
    .cli() // this doesn't seem to work
    .deploy(function (err) {
        console.log(err ? "BAD!" : "ALL OK!");
    })
;

// XXX
//  - set vhost
//  - attach index
//  - load angular
//  - load bootstrap
//  - process CLI
//  - deploy


