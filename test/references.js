
var AppTester = require("couth/lib/tester")
,   pth = require("path")
,   async = require("async")
,   tester = new AppTester("references", pth.join(__dirname, "../local-config.json"))
,   refs = [
        { id: "HTMLX", status: "WD", href: "http://html", title: "HTML5", date: "2013-03-10", authors: [{ name: "Robin"}], etAl: true }
    ,   { id: "SVGX", status: "REC", href: "http://svg", title: "SVG 1.1", date: "1977-03-15", authors: [{ name: "Jon"}], etAl: false }
    ,   { id: "REXX", status: null, href: "http://rex", title: "Remote Events for XML" }
    ]
,   valid = { id: "A", status: "CR", href: "a", title: "A" }
,   invalid = { id: 42 }
;

describe("Specifications", function () {
    it("should populate", function (done) {
        tester.populate(refs, done);
    });
    it("should get each individually", function (done) {
        tester.each("id", refs, done);
    });
    it("should get all at once", function (done) {
        tester.all(refs, done);
    });
    it("should update documents", function (done) {
        refs[0].authors.push({ name: "Ted" });
        tester.update(refs[0], done);
    });
    it("should enforce permissions", function (done) {
        async.series([
            function (cb) { tester.noGuestCreate(valid, cb); }
        ,   function (cb) { tester.noGuestUpdate(refs[0], "id", cb); }
        ,   function (cb) { tester.noGuestDelete(refs[0], cb); }
        ], done);
    });
    it("should remove the documents", function (done) {
        tester.remove(refs, done);
    });
    it("should reject invalid documents", function (done) {
        tester.noInvalid(invalid, done);
    });
});
