
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

// production values
app
    .prod()
        .deployTo("https://deploy.library.w3c-test.org/")
        .vhost("library.w3c-test.org")
;

// universal
app
    .all()
    .db("w3clibrary")
;

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


