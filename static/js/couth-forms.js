/*global angular */

angular.module("couth-forms", [])
    // .factory("couthForms", function () {
    //     function CouthForms () {}
    //     CouthForms.prototype
    //     return new CouthForms();
    // })
    .directive("couthForm", function () {
        var formDef = {
            scope:      true
        ,   restrict:   "A"
        ,   replace:    false
         // XXX this doesn't seem to be doing anything for now, or rather the include is not triggering
         // we need to ensure that this has a correct full path because the url is not resolved
         // relative to script
        ,   template:   "<div ng-include=\"'/js/couth-forms.html'\"></div>"
        ,   link:   function (scope, el, attrs) {
                console.log(scope, el, attrs);
                // we could $watch this, but I'm not sure it's a great idea to change it at runtime
                scope.$couthType = attrs.couthType;
                scope.$couthSchemaURL = "/couth/types/" + attrs.couthType + ".json";
                // get attributes for:
                //      - schema source
                //      - ui tweaks source
                //      - new or edit (adds _id and _rev)
            }
        };
        return formDef;
    })
    .controller("CouthFormCtrl", function ($scope, $http) {
        $scope.$watch("$couthSchemaURL", function (val) {
            $http({
                method: "GET"
            ,   url:    val
            ,   cache:  true
            }).success(function (data) {
                $scope.couthSchema = data;
                console.log("DATA", data);
                var path = ["$root"]
                ,   root = []
                ,   isArray = function (obj) {
                        return Object.prototype.toString.call(obj) === "[object Array]";
                    }
                ,   toEnum = function (sch, cur) {
                        if (!sch["enum"]) return;
                        cur.subtype = cur.type;
                        cur.type = "enum";
                        cur.values = sch["enum"];
                    }
                ,   processSchema = function (sch, fields, name) {
                        if (name === "$type") return;
                        var cur = {
                            type:           sch.type || "any"
                        ,   description:    sch.description || ""
                        ,   required:       sch.required || false
                        ,   path:           path.join(".")
                        };
                        if (name) cur.name = name;
                        if (!sch.type || sch.type === "any") {
                            // not sure what to do with these
                            // maybe a simple key-value map, but it doesn't make much sense
                            cur.type = "hidden";
                        }
                        else if (sch.type === "object") {
                            cur.fields = [];
                            for (var p in sch.properties) {
                                path.push(p);
                                processSchema(sch.properties[p], cur.fields, p);
                                path.pop();
                            }
                        }
                        else if (sch.type === "array") {
                            if (isArray(sch.items)) {
                                // XXX this can be handled, but later
                                console.log("XXX We don't yet support arrays of types");
                            }
                            else {
                                var items = [];
                                path.push("[*]");
                                console.log("schema items", sch.items);
                                processSchema(sch.items, items);
                                console.log("items", items);
                                cur.items = items[0];
                                path.pop();
                            }
                            if (sch.minItems) cur.minItems = sch.minItems;
                            if (sch.maxItems) cur.maxItems = sch.maxItems;
                            if (sch.uniqueItems) cur.uniqueItems = sch.uniqueItems;
                        }
                        else if (sch.type === "string") {
                            toEnum(sch, cur);
                            cur.pattern = sch.pattern || null;
                            // cur.minLength = sch.minLength || false; // XXX missing in HTML
                            cur.maxLength = sch.maxLength || null;
                        }
                        else if (sch.type === "number") {
                            toEnum(sch, cur);
                            // XXX the exclusive options are not supported
                            // though maybe with a range?
                            cur.max = sch.maximum || false;
                            cur.min = sch.minimum || false;
                        }
                        else if (sch.type === "boolean") {
                            toEnum(sch, cur);
                        }
                        else if (sch.type === "null") {
                            cur.type = "hidden";
                        }
                        else if (isArray(sch.type)) {
                            cur.type = "union";
                            cur.fields = [];
                            for (var i = 0, n = sch.type.length; i < n; i++) processSchema(sch.type[i], cur.fields);
                        }
                        fields.push(cur);
                    }
                ;
                processSchema(data, root);
                console.log(root);
                root[0].fields.unshift({ type: "hidden", name: "_rev" });
                root[0].fields.unshift({ type: "hidden", name: "_id" });
                $scope.$couthForm = root[0];
                $scope.$couthPath = function (path) {
                    var obj = $scope.$couthObject
                    ,   parts = path.split(".")
                    ;
                    parts.shift();
                    if (!obj) return obj;
                    for (var i = 0, n = parts.length; i < n; i++) {
                        var key = parts[i];
                        if (/^\[\d+\]$/.test(key)) key = 1 * key.replace("[", "").replace("]", "");
                        obj = obj[key];
                        if (typeof(obj) === "undefined" || obj === null) return obj;
                    }
                    return obj;
                };
            }).error(function () {
                // XXX dispatch an error event
            });
        });

        
        // grab the schema source
        // convert it to a form structure
        // assign the latter to scope.$couthForm
        // run the template
        // where do we get the instance from?
        //
        // convert that into something
        //  object becomes a fieldset, with ng-form
        //  that way we get nested forms that maintain their own context
        //  and we avoid naming conflicts
        //  array items get an ng-form too
        //
        // console.log("CouthFormCtrl", $scope);
        // $scope.$couthForm = {
        //     fields: [
        //         { type: "string" }
        //     ,   { type: "number" }
        //     ,   { type: "boolean" }
        //     ,   { type: "object", fields: [ { type: "number"}, { type: "boolean" }] }
        //     ,   { type: "string" }
        //     ]
        // };
    })
;

// {
//     type:           "object"
// ,   description:    "Specification"
// ,   path:           "$root"
// ,   fields: [
//         {
//             type:           "string"
//         ,   description:    "Short name"
//         ,   name:           "shortName"
//         ,   path:           "$root.shortName"
//         }
//     ,   {
//             type:           "array"
//         ,   description:    "Sources"
//         ,   name:           "sources"
//         ,   path:           "$root.sources"
//         ,   items:  {
//                 type:   "object"
//             ,   path:   "$root.sources[n]"
//             ,   fields: [
//                     {
//                         type:           "string"
//                     ,   description:    "URL"
//                     ,   name:           "url"
//                     ,   path:           "$root.sources[n].url"
//                     }
//                 ,   {
//                         type:           "enum"
//                     ,   subtype:        "string"
//                     ,   description:    "Type"
//                     ,   name:           "type"
//                     ,   path:           "$root.sources[n].type"
//                     ,   values:         ["html-spec", "respec-source", "respec-output"]
//                     }
//                 ]
//             }
//         }
//     ]
// }
// {
//     type:           "object"
// ,   description:    "Specification"
// ,   properties: {
//         shortName:  namedRequiredString("Short name")
//     ,   sources:    {
//             type:           "array"
//         ,   description:    "Sources"
//         ,   items:  {
//                 type:   "object"
//             ,   properties: {
//                     url:    namedRequiredString("URL")
//                 ,   type:   {
//                         type:           "string"
//                     ,   description:    "Type"
//                     ,   "enum":         ["html-spec", "respec-source", "respec-output"]
//                     }
//                 }
//             }
//         }
//     }
// }
