/*jshint evil: true*/
/*global berjon*/

var fs = require("fs")
,   _ = require("underscore")
,   request = require("request")
,   endpoint = "http://robin:cookbook@lib.w3.dev/references/create"
,   bibpath = "/Projects/respec/bibref/biblio.js"
,   fixEnt = function (str) {
        if (!str) return str;
        return str.replace(/&([\S]+?);/g, function (m, m1) {
            var val;
            if (m1 === "quot") val = '"';
            else if (m1 === "amp") val = '&';
            else if (/^#\d+$/.test(m1)) val = String.fromCharCode(+m1.replace("#", ""));
            if (!val) console.log("");
            return val;
        });
    }
;

eval(fs.readFileSync(bibpath, "utf8"));
for (var k in berjon.biblio) {
    (function (k) {
        var entry = berjon.biblio[k];
        if (_.isString(entry)) entry = { html: entry };
        entry.title = fixEnt(entry.title);
        entry.href = fixEnt(entry.href);
        entry.date = fixEnt(entry.date);
        entry.id = k;
        entry.couthType = "references";
        if (entry.authors) {
            var authors = [];
            for (var i = 0, n = entry.authors.length; i < n; i++) {
                authors.push({ name: fixEnt(entry.authors[i]) });
            }
            entry.authors = authors;
        }
        request.get(endpoint.replace("create", entry.id), function (err, res, doc) {
            var doc = _.isString(doc) ? JSON.parse(doc) : doc;
            if (doc.error === "not_found") {
                request.post(endpoint, { json: entry }, function (err, res, doc) {
                    if (err) return console.log("ERROR for " + k);
                    if (res.statusCode !== 201) return console.log("ERROR", k, doc);
                    console.log("OK:" + k);
                });
            }
            else {
                // doc.title = fixEnt(doc.title);
                // doc.href = fixEnt(doc.href);
                // doc.date = fixEnt(doc.date);
                // for (var i = 0, n = doc.authors.length; i < n; i++) {
                //     doc.authors[i] = { name: fixEnt(doc.authors[i]) };
                // }
                // request.put(endpoint.replace("create", entry._id), { json: entry }, function (err, res, doc) {
                //     if (err) return console.log("ERROR for " + k);
                //     if (res.statusCode !== 201) return console.log("ERROR", k, doc);
                //     console.log("OK:" + k);
                // });
            }
        });
    }(k));
}
