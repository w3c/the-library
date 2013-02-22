/*global angular */

angular.module("the-library", ["the-library-api"])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", { templateUrl: "/templates/home.html" })
            .when("/app/specs/", { controller: "SpecsCtrl", templateUrl: "/templates/specs.html" })
            .otherwise({ redirectTo: "/" });
    })
    .controller("NavCtrl", function ($scope, $rootScope, $location) {
        $rootScope.pathActive = function (path) {
            return ($location.path().substr(0, path.length) === path) ? "active" : "";
        };
    })
    .controller("SpecsCtrl", function ($scope, $rootScope, Specs) {
        var specs = Specs.list();
        $scope.specs = specs.rows;
        $scope.count = specs.total_rows;
        // XXX don't do that
        // replace with a real controller on the form that:
        //  - can do new
        //  - can do edit
        //  - can serialise and send, taking _id, _rev, and proper URL/$resource.action into account
        // $type needs to be part of the form (both new and edit), remove that silly code
        // UI to show form (new button)
        // add a bunch of content
        // list content
        //  - click row to edit
        // pagination
        var $formScope = angular.element($("#spec-form")[0]).scope();
        $formScope.shortName = "test-me";
        $formScope.sources = [
            { url: "http://berjon.com/specA", type: "respec-source" }
        ,   { url: "http://www.org/TR/html5", type: "html-spec" }
        ];
    })
;
