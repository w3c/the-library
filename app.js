
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
        .webAppRoot("/app/")
;

// load statics
var statPath = pth.join(__dirname, "static");
app.addStaticDir(statPath);

// helpers
function namedRequiredString (name, pat) {
    var ret = { type: "string", description: name, required: true };
    if (pat) ret.pattern = pat;
    return ret;
}

// ### SPECS ###
app.type("specs")
    .schema({
        type:           "object"
    ,   description:    "Specification"
    ,   properties: {
            shortName:  namedRequiredString("Short name", "^\\S+$")
        ,   sources:    {
                type:           "array"
            ,   description:    "Sources"
            ,   items:  {
                    type:   "object"
                ,   properties: {
                        url:    namedRequiredString("URL")
                    ,   type:   {
                            type:           "string"
                        ,   description:    "Type"
                        ,   required:       true
                        ,   "enum":         ["html-spec", "respec-source", "respec-output"]
                        }
                    }
                }
            }
        }
    })
    .permissions({
        create: "logged"
    ,   update: "logged"
    ,   del:    "admin"
    })
    .crudify({
        id: "shortName"
    })
;


// process CLI and run
app
    .cli()
    .deploy(function (err) {
        console.log(err ? "BAD!" : "ALL OK!");
    })
;

