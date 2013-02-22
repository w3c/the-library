/*global angular */

// THE PLAN
//  - switch to a super simple schema (just a string or some such)
//  - include a dump that monitors the form's scope so we can see the data {{ scope | json }} or something
//  - add some submit and reset buttons
//  - then incrementally complexify the schema until we can support our stuff
//  - also incrementally fix the styling and add UI controls

angular.module("couth-forms", [])
    // maybe drop this?
    // .directive("couthForm", function () {
    //     return {
    //         scope:      true
    //     ,   restrict:   "A"
    //     ,   replace:    false
    //     // XXX
    //     // we need to ensure that this has a correct full path because the url is not resolved
    //     // relative to script. Once this is folded into couth it'll be under /couth/ alongside
    //     // this script
    //     // ,   template:   "<div ng-include=\"'/js/couth-forms.html'\"></div>"
    //     ,   link:   function (scope, el, attrs) {
    //             // console.log(scope, el, attrs);
    //             // we could $watch this, but I'm not sure it's a great idea to change it at runtime
    //             scope.$couthType = attrs.couthType;
    //             // scope.$couthSchemaURL = "/couth/types/" + attrs.couthType + ".json";
    //             // XXX debug
    //             // scope.$couthSchemaURL = "/js/dev.json";
    //             // XXX add support for ui tweaking
    //         }
    //     };
    // })
;
