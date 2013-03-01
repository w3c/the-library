
var AppTester = require("./lib/tester")
,   async = require("async")
,   tester = new AppTester("specs")
,   specs = [
        { shortName: "html", sources: [] }
    ,   { shortName: "rex", sources: [{ url: "http://rex", type: "html-spec" }] }
    ,   { shortName: "svg", sources: [{ url: "http://svg1", type: "respec-source" }, { url: "http://svg2", type: "respec-output" }] }
    ]
,   valid = { shortName: "xpath", sources: [] }
,   invalid = { shortName: 42 }
;

describe("Specifications", function () {
    it("should populate", function (done) {
        tester.populate(specs, done);
    });
    it("should get each individually", function (done) {
        tester.each("shortName", specs, done);
    });
    it("should get all at once", function (done) {
        tester.all(specs, done);
    });
    it("should update documents", function (done) {
        specs[0].sources.push({ url: "http://html", type: "html-spec" });
        tester.update(specs[0], done);
    });
    it("should enforce permissions", function (done) {
        async.series([
            function (cb) { tester.noGuestCreate(valid, cb); }
        ,   function (cb) { tester.noGuestUpdate(specs[0], "shortName", cb); }
        ,   function (cb) { tester.noGuestDelete(specs[0], cb); }
        ], done);
    });
    it("should remove the documents", function (done) {
        tester.remove(specs, done);
    });
    it("should reject invalid documents", function (done) {
        tester.noInvalid(invalid, done);
    });
});
