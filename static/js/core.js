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
    // XXX a lot of what's below needs to be made generic
    // probably not as a controller since we want to allow people the ability
    // to do their own thing there, but certainly as a service
    // just make a factory that can do some of this automatically
    .controller("SpecsCtrl", function ($scope, $rootScope, Specs) {
        function loading () { $scope.$emit("couth:loading"); }
        function done () { $scope.$emit("couth:done"); }
        function listSpecs () {
            Specs.list(function (data) {
                $scope.specs = data.rows;
                $scope.count = data.total_rows;
            });
        }
        listSpecs();

        function commonError (err) {
            done();
            console.log(err);
            var reason = "unknown";
            if (err.data) reason = err.data.reason || err.data.error;
            $scope.$emit("couth:error", { status: err.status, reason: reason });
        }
        function makeCommonSuccess (obj, scope, mode) {
            return function () {
                done();
                if (scope) scope.$couthFormShow = false;
                $scope.$emit("couth:success", { reason: "Specification " + mode + "d." });
                listSpecs();
            };
        }
        $scope.$on("couth:create", function (evt, obj, scope) {
            loading();
            Specs.create(obj, makeCommonSuccess(obj, scope, "create"), commonError);
        });
        $scope.$on("couth:update", function (evt, obj, scope) {
            loading();
            Specs.update(obj, makeCommonSuccess(obj, scope, "update"), commonError);
        });
        // XXX for this we need to make sure that we prompt to confirm first
        $scope.$on("couth:delete", function (evt, obj) {
            loading();
            Specs.del(obj, makeCommonSuccess(obj, null, "delete"), commonError);
        });
    })
;
