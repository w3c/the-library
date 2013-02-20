/*global angular */

angular.module("the-library", ["the-library-api", "couth-forms"])
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
    })
;
