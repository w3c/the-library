/*global angular */

angular.module("the-library", ["CouthResourceAPI"])
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
    // XXX keep this on for debug
    // .config(function ($httpProvider) {
    //     $httpProvider.responseInterceptors.push(function () {
    //         return function (promise) {
    //             return promise.then(
    //                     function (res) {
    //                         console.log("[OK] %s for %s %s", res.status, res.config.method, res.config.url);
    //                         return res;
    //                     }
    //                 ,   function () {
    //                         console.log("[ERROR]", arguments);
    //                         return arguments;
    //                     }
    //             );
    //         };
    //     });
    // })
    // XXX a lot of what's below needs to be made generic
    // probably not as a controller since we want to allow people the ability
    // to do their own thing there, but certainly as a service
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
            return function (data) {
                done();
                scope.$couthFormShow = false;
                $scope.$emit("couth:success", { reason: "Specification " + mode + "d." });
                listSpecs();
            };
        }
        $scope.$on("couth:create", function (evt, obj, scope) {
            loading();
            // check that the object doesn't exist before creating it
            Specs.read( obj
                    ,   function () {
                            $scope.$emit("couth:error", { reason: "ID already exists. "});
                        }
                    ,   function () {
                            Specs.create(obj, makeCommonSuccess(obj, scope, "create"), commonError);
                        }
            );
        });
        $scope.$on("couth:update", function (evt, obj, scope) {
            loading();
            console.log("calling update");
            Specs.update(obj, makeCommonSuccess(obj, scope, "update"), commonError);
        });
    })
    // XXX
    // move this to a generic couth module
    .controller("CouthFormCtrl", function ($scope, $parse) {
        $scope.$couthMode = "new";
        $scope.$couthSave = function () {
            if (!$scope.$couthForm.$valid) {
                // XXX add some details here
                $scope.$emit("couth:error", { reason: "Form is invalid." });
                return;
            }
            // dispatch an event (couth:create or couth:update) to which a higher-up controller can listen
            $scope.$emit($scope.$couthMode === "new" ? "couth:create" : "couth:update", $scope.$couthInstance, $scope);
        };
        $scope.$couthReset = function (evt) {
            // XXX need to revert in edit mode (otherwise we maintain weird data)
            $scope.$couthFormShow = false;
            evt.preventDefault();
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
            
            var getter = $parse(path)
            ,   arr = getter($scope)
            ;
            if (!arr) {
                arr = [];
                getter.assign($scope, arr);
            }
            arr.push(empty);
            evt.preventDefault();
        };
        // XXX
        //  edit communication model
        //  $emit("couth:delete", spec)
        //      - first shows a confirmation
        //      - then dispatches to the API (which means we need to know which one it is, which means refactoring)
        
        // replace with a real controller on the form that:
        //  - can do new (how does one reset automatically? need to generate empty shallow instance from schema)
        //  - can do edit
        //  - can serialise and send, taking _id, _rev, and proper URL/$resource.action into account
        // UI to show form (new button)
        // list content
        //  - click row to edit
        // pagination
        // some common CSS complementing bootstrap loaded in /couth/css/form.css
    })
    // XXX move this to couth
    // built from http://www.smartjava.org/content/drag-and-drop-angularjs-using-jquery-ui
    .directive("couthDnd", function() {
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
    // XXX move this to couth
    .directive("couthType", function () {
        return function (scope, element, attrs) {
            scope.$emit("couth:register-editor", attrs.couthType, scope);
        };
    })
    // XXX move this to couth
    .controller("CouthCtrl", function ($scope, $rootScope, $http) {
        function loading () { $scope.$emit("couth:loading"); }
        function done () { $scope.$emit("couth:done"); }
        loading();

        // manage users
        function resetUser () {
            $rootScope.$couthUser = {
                name:       null
            ,   roles:      []
            ,   isAdmin:    false
            };
        }
        function isAdmin (roles) {
            return roles.indexOf("_admin") > -1;
        }
        $http.get("/couth/session")
            .success(function (data) {
                done();
                $rootScope.$couthUser = data.userCtx;
                $rootScope.$couthUser.isAdmin = isAdmin(data.userCtx.roles);
            })
            .error(function () {
                done();
                resetUser();
                $scope.$emit("couth:error", { reason: "Failed to open a session with the server." });
            })
        ;
        $rootScope.$couthLogin = function (username, password, cb) {
            loading();
            $http.post("/couth/login", { name: username, password: password })
                .success(function (data) {
                    done();
                    if (!$rootScope.$couthUser) $rootScope.$couthUser = {};
                    $rootScope.$couthUser.name = username; // Couch returns null for that
                    $rootScope.$couthUser.roles = data.roles;
                    $rootScope.$couthUser.isAdmin = isAdmin(data.roles);
                    cb();
                })
                .error(function (data, status) {
                    done();
                    resetUser();
                    $scope.$emit("couth:error", { status: status, reason: data.reason || "Login failed." });
                })
            ;
        };
        $rootScope.$couthLogout = function () {
            loading();
            $http["delete"]("/couth/logout")
                .success(function () {
                    done();
                    resetUser();
                })
                .error(function () {
                    done();
                    // I'm not sure this can ever happen
                    $scope.$emit("couth:error", { reason: "Logout failed." });
                })
            ;
        };
        $rootScope.$couthSignup = function (username, password, cb) {
            var id = encodeURIComponent("org.couchdb.user:" + username);
            loading();
            $http.put("/couth/signup/" + id, { name: username, password: password, type: "user", roles: [] })
                .success(function () {
                    done();
                    if (!$rootScope.$couthUser) $rootScope.$couthUser = {};
                    $rootScope.$couthUser.name = username;
                    $rootScope.$couthUser.roles = [];
                    $rootScope.$couthUser.isAdmin = false;
                    cb();
                })
                .error(function (data, status) {
                    done();
                    $scope.$emit("couth:error", { status: status, reason: data.reason || "Signup failed." });
                })
            ;
        };
        // expose the above to forms
        $rootScope.$couthSignupForm = function (evt, username, password) {
            evt.preventDefault();
            $rootScope.$couthSignup(username, password, function () {
                // this isn't kosher, but I can't think of a cleaner way of tell Bootstrap
                // to remove its dropdown
                $("body").trigger("click");
            });
        };
        $rootScope.$couthLoginForm = function (evt, username, password) {
            evt.preventDefault();
            $rootScope.$couthLogin(username, password, function () {
                // this isn't kosher, but I can't think of a cleaner way of tell Bootstrap
                // to remove its dropdown
                $("body").trigger("click");
            });
        };
        
        // loading indicator
        $scope.$couthLoading = false;
        $scope.$on("couth:loading", function () {
            $scope.$couthLoading = true;
        });
        $scope.$on("couth:done", function () {
            $scope.$couthLoading = false;
        });
        
        // errors and successes messaging
        $scope.$couthError = false;
        $scope.$on("couth:error", function (evt, data) {
            $scope.$couthError = data.reason;
        });
        $scope.$couthSuccess = false;
        $scope.$on("couth:success", function (evt, data) {
            $scope.$couthSuccess = data.reason;
        });
        
        // editor management
        $scope.$couthEditors = {};
        $scope.$on("couth:register-editor", function (evt, type, scope) {
            $scope.$couthEditors[type] = scope;
        });
        $scope.$on("couth:edit", function (evt, obj) {
            if (!obj.couthType) return;
            var ed = $scope.$couthEditors[obj.couthType];
            if (!ed) return;
            ed.$couthInstance = obj;
            ed.$couthMode = "edit";
            ed.$couthFormShow = true;
        });
        $scope.$on("couth:new", function (evt, type) {
            var ed = $scope.$couthEditors[type];
            if (!ed) return;
            ed.$couthInstance = { couthType: type };
            ed.$couthMode = "new";
            ed.$couthFormShow = true;
        });
    })
;
