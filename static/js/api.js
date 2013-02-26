/*global angular */

// XXX this should have interceptors for errors (or whatever works)
// http://www.espeo.pl/2012/02/26/authentication-in-angularjs-application
// except that we have 403 for this, and that we should also intercept 409,
// 404 and possibly others since they map to real errors
// we need a root couthUser object that can also make it possible to have
// templates that display different controls depending on its value

angular.module("the-library-api", ["ngResource"])
    .config(function ($httpProvider) {
        $httpProvider.defaults.transformRequest = [function (d) {
            return angular.isObject(d) ? JSON.stringify(d) : d;
        }];
    })
    .factory("Specs", function ($resource) {
        return $resource("/specs/", {}, {
            list:   { method: "GET", isArray: true }
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
        ,   update: { method: "PUT", transformRequest: [] }
        ,   remove: { method: "DELETE" }
        });
    })
;
