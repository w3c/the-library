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
    })
    // XXX
    // move this to a generic couth module
    .controller("CouthFormCtrl", function ($scope) {
        $scope.$couthInstance = {
            shortName:  "test-me"
        ,   sources:    [
                { url: "http://berjon.com/specA", type: "respec-source" }
            ,   { url: "http://www.org/TR/html5", type: "html-spec" }
            ]
        };
        $scope.$couthSave = function () {
            // XXX
            // check that it's valid, if not return
            //  - how do I access couthForm?
            //  - how do I wire this into the API? an event?
            console.log($scope);
        };
        $scope.$couthArrayDel = function (path, idx, evt) {
            $scope.$eval(path).splice(idx, 1);
            evt.preventDefault();
        };
        $scope.$couthArrayAdd = function (path, type, evt) {
            var empty;
            if (type === "object" || type === "any" || !type) empty = {};
            else if (type === "array") empty = [];
            else if (type === "string") empty = "";
            else if (type === "number") empty = 0;
            else if (type === "boolean") empty = false;
            else if (type === "null") empty = null;
            console.log(path, $scope.$eval(path));
            $scope.$eval(path).push(empty);
            evt.preventDefault();
        };
        // replace with a real controller on the form that:
        //  - can do new (how does one reset automatically? need to generate empty shallow instance from schema)
        //  - can do edit
        //  - can serialise and send, taking _id, _rev, and proper URL/$resource.action into account
        // UI to show form (new button)
        // add a bunch of content
        // list content
        //  - click row to edit
        // pagination
        // some common CSS complementing bootstrap loaded in /couth/css/form.css
        
    })
    // XXX move this to the core
    // built from http://www.smartjava.org/content/drag-and-drop-angularjs-using-jquery-ui
    .directive('couthDnd', function() {
        return function (scope, element, attrs) {
            var toUpdate
            ,   startIndex = -1
            ,   path = attrs.couthDnd
            ;
            // watch the model so we know which element is where
            scope.$watch(attrs.couthDnd, function (val) { toUpdate = val; }, true);

            // use jqUI to make the element sortable
            $(element[0]).sortable({
                items:          "> fieldset"
            ,   cursor:         "move"
            ,   handle:         ".couth-move"
            ,   axis:           "y"
            ,   placeholder:    "couth-placeholder"
            ,   tolerance:      "pointer"
            ,   forcePlaceholderSize:   true
            ,   opacity:        0.6
            ,   start:  function (event, ui) {
                    startIndex = $(ui.item).index();
                }
            ,   stop:   function (event, ui) {
                    // on stop we determine the new index of the
                    // item and store it there
                    var newIndex = $(ui.item).index()
                    ,   toMove = toUpdate[startIndex];
                    toUpdate.splice(startIndex, 1);
                    toUpdate.splice(newIndex, 0, toMove);
                    // trigger an update in angular use $apply()
                    // since we're outside angulars lifecycle
                    scope.$apply(scope.$eval(path));
                }
            });
        };
    })
;
