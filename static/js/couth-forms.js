/*global angular */

angular.module("couth-forms", [])
    // .factory("couthForms", function () {
    //     function CouthForms () {}
    //     CouthForms.prototype
    //     return new CouthForms();
    // })
    .directive("couth-form", function () {
        var formDef = {
            scope:      true
        ,   restrict:   "A"
        ,   replace:    false
        ,   template:   "" // XXX need to define this
        ,   link:   function (scope, el, attrs) {
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

