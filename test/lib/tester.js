
var fs = require("fs")
,   pth = require("path")
// ,   cradle = require("cradle")
,   request = require("request")
,   localConfigPath = pth.join(__dirname, "../../local-config.json")
,   expect = require("expect.js")
;


function AppTester (name) {
    this.name = name;
    if (!fs.existsSync(localConfigPath)) throw new Error("You need a local-config.json so as to test against a dev version.");
    var local = require(localConfigPath);
    this.server = "http://" + local.vhost + ":" + local.port;
    this.auth = { user: local.auth.username, pass: local.auth.password };
    // this.cradle = new cradle.Connection({
    //         host: local.vhost
    //     ,   port: local.port || 5984
    //     ,   auth: local.auth
    //     })
    //     .database("w3clibrary")
    // ;
    // this.cradleAnon = new cradle.Connection({
    //         host: local.vhost
    //     ,   port: local.port || 5984
    //     })
    //     .database("w3clibrary")
    // ;
}

AppTester.prototype = {
    populate:   function (path, objects, cb) {
        // for each object
        //  set its type
        //  POST it to the path
        var url = this.server + path, self = this;
        function sendObj () {
            if (!objects.length) return cb();
            var obj = objects.shift();
            obj.$type = self.name;
            request.post(url, { json: obj, auth: self.auth }, function (err, res) {
                expect(err).to.not.be.ok();
                expect(res.statusCode).to.equal(201);
                obj._rev = res.headers["x-couch-update-newrev"];
                sendObj();
            });
        }
        sendObj();
    }
,   remove: function (path, objects, cb) {
        var url = this.server + path, self = this;
        function sendObj () {
            if (!objects.length) return cb();
            var obj = objects.shift();
            request.del(url.replace("*", obj._id), { auth: self.auth }, function (err, res) {
                expect(err).to.not.be.ok();
                expect(res.statusCode).to.equal(201);
                sendObj();
            });
        }
        sendObj();
    }
};

module.exports = AppTester;

