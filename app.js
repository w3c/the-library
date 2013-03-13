
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
    if (local.prod) {
        app.prod();
        if (local.prod.auth) app.auth(local.prod.auth);
    }
}

// production settings
app
    .prod()
        // XXX a DNS problem is preventing this for now
        // .deployTo("https://deploy.library.w3c-test.org/")
        // .vhost("library.w3c-test.org")
        .deployTo("http://deploy.2017.im/")
        .port(80)
        .vhost("library.2017.im")
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


// ### REFERENCES ###
app.type("references")
    .schema({
        type:           "object"
    ,   description:    "Reference"
    ,   properties: {
            id:         namedRequiredString("ID", "^[\\w_\\.-]+$")
        ,   href:       {
                type:           "string"
            ,   description:    "URL"
            }
        ,   title:          {
                type:           "string"
            ,   description:    "Title"
            }
        ,   date:   {
                type:           "string"
            ,   description:    "Date"
            }
        ,   status: {
                type:           ["string", "null"]
            ,   description:    "Status"
            ,   "enum":     [
                    "NOTE", "ED", "FPWD", "WD", "LCWD", "CR", "PR", "REC", null
                ]
            }
        ,   authors:    {
                type:           "array"
            ,   description:    "Authors"
            // arrays of primitives don't play too well with Angular
            ,   items:  {
                    type:       "object"
                ,   properties: {
                        name:   namedRequiredString("Author")
                    }
                }
            }
        ,   etAl:   {
                type:           "boolean"
            ,   description:    "Et al."
            }
        ,   html:   {
                type:           "string"
            ,   description:    "HTML (avoid)"
            }
        }
    })
    .permissions({
        create: "logged"
    ,   update: "logged"
    ,   del:    "admin"
    })
    .crudify({
        id:     "id"
    ,   jsonp:  true
    })
;

// process CLI and run
app
    .cli()
    .deploy(function (err) {
        console.log(err ? "BAD!" : "ALL OK!");
    })
;

