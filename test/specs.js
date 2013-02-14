
var AppTester = require("./lib/tester")
,   async = require("async")
,   tester = new AppTester("spec")
,   specs = [
        { shortName: "html", sources: [] }
    ,   { shortName: "rex", sources: [{ url: "http://rex", type: "html-spec" }] }
    ,   { shortName: "svg", sources: [{ url: "http://svg1", type: "respec-source" }, { url: "http://svg2", type: "respec-output" }] }
    ]
;

async.series([
    function (cb) { tester.populate("/specs/create", specs, cb); }
// ,   function (cb) { tester.each("/spec/:id", "shortName", specs, cb); }
// ,   function (cb) { tester.all("/specs", specs, cb); }
,   function (cb) { tester.remove("/spec/*", specs, cb); }
]);

// XXX
// - check that create, update, delete without being logged produces an error
// - check that creating or updating an invalid document fails
