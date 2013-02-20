/*global angular */

angular.module("couth-forms", [])
    // .factory("couthForms", function () {
    //     function CouthForms () {}
    //     CouthForms.prototype
    //     return new CouthForms();
    // })
    .config(function () {
        console.log("config");
    })
    .directive("couthForm", function () {
        console.log("directive called");
        var formDef = {
            scope:      true
        ,   priority:   10000
        ,   restrict:   "A"
        ,   replace:    false
         // XXX this doesn't seem to be doing anything for now, or rather the include is not triggering
        ,   template:   "<div ng-include='couth-forms.html'></div>"
        ,   link:   function (scope, el, attrs) {
                console.log(scope, el, attrs);
                // get attributes for:
                //      - schema source
                //      - ui tweaks source
                //      - new or edit (adds _id and _rev)
                // grab the schema source
                // convert it to a form structure
                // assign the latter to scope.$couthForm
                // run the template
                // where do we get the instance from?
            }
        };
        return formDef;
    })
;
