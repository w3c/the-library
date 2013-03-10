/*global angular */

angular.module("the-library", ["CouthClient", "CouthResourceAPI"])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", { templateUrl: "/templates/home.html" })
            .when("/app/refs/", { controller: "RefsCtrl", templateUrl: "/templates/refs.html" })
            .otherwise({ redirectTo: "/" });
    })
    .controller("NavCtrl", function ($scope, $rootScope, $location) {
        $rootScope.pathActive = function (path) {
            return ($location.path().substr(0, path.length) === path) ? "active" : "";
        };
    })
    .controller("RefsCtrl", function ($scope, References, CouthSimpleCRUD) {
        CouthSimpleCRUD.runForType({
            type:   References
        ,   name:   "Reference"
        ,   scope:  $scope
        ,   onload: function (data) {
                $scope.references = data.rows;
                $scope.count = data.total_rows;
            }
        ,   pagination: {
                pageSize:   50
            ,   countExpr:  "count"
            }
        });
    })
;
