/*global angular */

// XXX this should have interceptors for errors (or whatever works)
// http://www.espeo.pl/2012/02/26/authentication-in-angularjs-application
// except that we have 403 for this, and that we should also intercept 409,
// 404 and possibly others since they map to real errors
// we need a root couthUser object that can also make it possible to have
// templates that display different controls depending on its value

angular.module("the-library-api", ["ngResource"])
    .factory("Specs", function ($resource) {
        return $resource("/specs/:action", {}, {
            list:   { method: "GET", action: "", isArray: true }
        ,   create: { method: "POST", action: "create" }
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
