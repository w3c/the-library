
var AppTester = require("./lib/tester")
,   async = require("async")
,   tester = new AppTester("spec")
,   specs = [
        { shortName: "html", sources: [] }
    ,   { shortName: "rex", sources: [{ url: "http://rex", type: "html-spec" }] }
    ,   { shortName: "svg", sources: [{ url: "http://svg1", type: "respec-source" }, { url: "http://svg2", type: "respec-output" }] }
    ]
;

describe("Specifications", function () {
    it("should populate", function (done) {
        tester.populate("/specs/create", specs, done);
    });
    it("should get each individually", function (done) {
        tester.each("/spec/:id", "shortName", specs, done);
    });
    it("should get all at once", function (done) {
        tester.all("/specs", specs, done);
    });
    it("should remove the documents", function (done) {
        tester.remove("/spec/*", specs, done);
    });
});

// XXX
// - check that create, update, delete without being logged produces an error
// - check that creating or updating an invalid document fails
