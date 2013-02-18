/*global angular */

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
