/*global angular */


// Change the API:
//  - make it so that we can have a single resource provider for an API
//  - make it so that couthType uses something else, like couthType, because it interferes with angular

// XXX
//  - update API (generate it)
//  - register it? that way it can be automatically plugged?

angular.module("the-library-api", ["ngResource"])
    .factory("Specs", function ($resource) {
        return $resource("/specs/", {}, {
            list:   { method: "GET" }
        });
    })
    .factory("CreateSpec", function ($resource) {
        return $resource("/specs/create", {}, {
            create: { method: "POST" }
        });
    })
    .factory("Spec", function ($resource) {
        return $resource("/spec/:id", {}, {
            read:   { method: "GET" }
        ,   update: { method: "PUT" }
        ,   remove: { method: "DELETE" }
        });
    })
;
