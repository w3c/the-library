/*global angular */

angular.module("the-library-api", ["ngResource"])
    .factory("Specs", function ($resource) {
        return $resource("/specs/"
                    ,   { callback: "JSON_CALLBACK" }
                    ,   { query: {}}
                    );
    })
;
