/*global angular */

angular.module("the-library", ["CouthClient", "CouthResourceAPI"])
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
    .controller("SpecsCtrl", function ($scope, Specs, CouthSimpleCRUD) {
        CouthSimpleCRUD.runForType({
            type:   Specs
        ,   name:   "Specification"
        ,   scope:  $scope
        ,   onload: function (data) {
                $scope.specs = data.rows;
                $scope.count = data.total_rows;
            }
        ,   pagination: {
                pageSize:   5
            ,   countExpr:  "count"
            }
        });
    })
;
