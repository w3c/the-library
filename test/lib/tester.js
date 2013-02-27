
var fs = require("fs")
,   pth = require("path")
,   request = require("request")
,   localConfigPath = pth.join(__dirname, "../../local-config.json")
,   expect = require("expect.js")
;

function AppTester (name) {
    this.name = name;
    if (!fs.existsSync(localConfigPath)) throw new Error("You need a local-config.json so as to test against a dev version.");
    var local = require(localConfigPath);
    this.server = "http://" + local.auth.username + ":" + local.auth.password + "@" + local.vhost + ":" + local.port;
    this.anonServer = "http://" + local.vhost + ":" + local.port;
}

AppTester.prototype = {
    populate:   function (path, objects, cb) {
        objects = objects.concat([]);
        // for each object
        //  set its type
        //  POST it to the path
        var url = this.server + path, self = this;
        function sendObj () {
            if (!objects.length) return cb();
            var obj = objects.shift();
            obj.couthType = self.name;
            request.post(url, { json: obj }, function (err, res, doc) {
                expect(err).to.not.be.ok();
                expect(res.statusCode).to.equal(201);
                obj._rev = res.headers["x-couch-update-newrev"];
                obj._id = doc.id;
                sendObj();
            });
        }
        sendObj();
    }
,   each: function (path, key, objects, cb) {
        objects = objects.concat([]);
        var url = this.server + path;
        function sendObj () {
            if (!objects.length) return cb();
            var obj = objects.shift();
            request.get(url.replace(":id", obj[key]), function (err, res, doc) {
                doc = JSON.parse(doc);
                expect(err).to.not.be.ok();
                expect(res.statusCode).to.equal(200);
                expect(doc._id).to.equal(obj._id);
                sendObj();
            });
        }
        sendObj();
    }
,   all: function (path, objects, cb) {
        var url = this.server + path;
        request.get(url, function (err, res, docs) {
            docs = JSON.parse(docs);
            expect(err).to.not.be.ok();
            expect(res.statusCode).to.equal(200);
            var docMap = {};
            for (var i = 0, n = docs.rows.length; i < n; i++) docMap[docs.rows[i].id] = true;
            for (var i = 0, n = objects.length; i < n; i++) expect(docMap[objects[i]._id]).to.be.ok();
            cb();
        });
    }
,   update: function (path, obj, cb) {
        var url = (this.server + path).replace(/:id$/, obj._id);
        request.put(url, { json: obj }, function (err, res) {
            expect(err).to.not.be.ok();
            expect(res.statusCode).to.equal(201);
            obj._rev = res.headers["x-couch-update-newrev"];
            cb();
        });
    }
,   noGuestCreate:  function (path, obj, cb) {
        obj.couthType = this.name;
        var url = this.anonServer + path;
        request.post(url, { json: obj }, function (err, res, doc) {
            expect(err).to.not.be.ok();
            expect(res.statusCode).to.equal(403);
            expect(doc.error).to.equal("forbidden");
            cb();
        });
        
    }
,   noGuestUpdate:  function (path, obj, cb) {
        var url = (this.anonServer + path).replace(/:id$/, obj._id);
        request.put(url, { json: obj }, function (err, res, doc) {
            expect(err).to.not.be.ok();
            expect(res.statusCode).to.equal(403);
            expect(doc.error).to.equal("forbidden");
            cb();
        });
    }
,   noGuestDelete:  function (path, obj, cb) {
        var url = (this.anonServer + path).replace(/:id$/, obj._id);
        request.del(url, function (err, res, doc) {
            doc = JSON.parse(doc);
            expect(err).to.not.be.ok();
            expect(res.statusCode).to.equal(403);
            expect(doc.error).to.equal("forbidden");
            cb();
        });
        
    }
,   noInvalid:  function (path, obj, cb) {
        var url = this.server + path;
        obj.couthType = this.name;
        request.post(url, { json: obj }, function (err, res, doc) {
            expect(err).to.not.be.ok();
            expect(res.statusCode).to.equal(403);
            expect(doc.error).to.equal("forbidden");
            cb();
        });
        
    }
,   remove: function (path, objects, cb) {
        objects = objects.concat([]);
        var url = this.server + path;
        function sendObj () {
            if (!objects.length) return cb();
            var obj = objects.shift();
            request.del(url.replace("*", obj._id), function (err, res) {
                expect(err).to.not.be.ok();
                expect(res.statusCode).to.equal(201);
                sendObj();
            });
        }
        sendObj();
    }
};

module.exports = AppTester;
