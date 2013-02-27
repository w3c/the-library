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
    .controller("SpecsCtrl", function ($scope, $rootScope, Specs, CreateSpec) {
        var specs = Specs.list();
        $scope.specs = specs.rows;
        $scope.count = specs.total_rows;
        $scope.$on("couth:create", function (evt, obj) {
            // XXX start progress indicator
            console.log("create", obj);
            var spec = new CreateSpec(obj);
            spec.$create(function () {
                console.log("success", arguments);
                // XXX
                //  - end progress indicator
                //  - reset form
                //  - reload Specs.list() // HOW?
                //  - showsuccess message (emit couth:success)
            }, function (err) {
                console.log(err);
                // XXX
                //  - end progress indicator
                //  - show error message
                var reason = "unknown";
                if (err.data) reason = err.data.reason || err.data.error;
                $scope.$emit("couth:error", { status: err.status, reason: reason });
            });
        });
        $scope.$on("couth:update", function (evt, obj) {
            console.log("update", obj);
        });
        $scope.$on("couth:error", function (evt, obj) {
            // XXX show the error using BS
            console.log(obj);
        });
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
        $scope.$couthMode = "new";
        $scope.$couthSave = function () {
            if (!$scope.$couthForm.$valid) {
                // XXX add some details here
                $scope.$emit("couth:error", { reason: "Form is invalid." });
                return;
            }
            // XXX
            // dispatch an event (couth:create or couth:update) to which a higher-up controller can listen
            var obj = JSON.parse(JSON.stringify($scope.$couthInstance, function (key, val) {
                if (key === "$$hashKey") return undefined;
                return val;
            }));
            $scope.$emit($scope.$couthMode === "new" ? "couth:create" : "couth:update", obj);
        };
        $scope.$couthReset = function (evt) {
            // XXX
            //  if in new mode, just kill the $couthInstance
            //  if in edit mode, revert to the original (which we save somewhere)
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
    // XXX move this to couth
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
    // XXX move this to couth
    .controller("CouthUserCtrl", function ($scope, $rootScope, $http) {
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
                $rootScope.$couthUser = data.userCtx;
                $rootScope.$couthUser.isAdmin = isAdmin(data.userCtx.roles);
            })
            .error(function () {
                resetUser();
                $scope.$emit("couth:error", { reason: "Failed to open a session with the server." });
            })
        ;
        $rootScope.$couthLogin = function (username, password) {
            $http.post("/couth/login", { name: username, password: password })
                .success(function (data) {
                    if (!$rootScope.$couthUser) $rootScope.$couthUser = {};
                    $rootScope.$couthUser.name = username; // Couch returns null for that
                    $rootScope.$couthUser.roles = data.roles;
                    $rootScope.$couthUser.isAdmin = isAdmin(data.roles);
                })
                .error(function (data, status) {
                    resetUser();
                    $scope.$emit("couth:error", { status: status, reason: data.reason || "Login failed." });
                })
            ;
        };
        $rootScope.$couthLogout = function () {
            $http["delete"]("/couth/logout")
                .success(resetUser)
                .error(function () {
                    // I'm not sure this can ever happen
                    $scope.$emit("couth:error", { reason: "Logout failed." });
                })
            ;
        };
        $rootScope.$couthSignup = function (username, password) {
            var id = encodeURIComponent("org.couchdb.user:" + username);
            $http.put("/couth/signup/" + id, { name: username, password: password, type: "user", roles: [] })
                .success(function () {
                    if (!$rootScope.$couthUser) $rootScope.$couthUser = {};
                    $rootScope.$couthUser.name = username;
                    $rootScope.$couthUser.roles = [];
                    $rootScope.$couthUser.isAdmin = false;
                })
                .error(function (data, status) {
                    $scope.$emit("couth:error", { status: status, reason: data.reason || "Signup failed." });
                })
            ;
        };
    })
;

// XXX login
//  we need to have backend mappings for that (which go above the _rewrite)
//      - /couth/session -> GET /_session
//      {"ok":true,"userCtx":{"name":null,"roles":[]},"info":{"authentication_db":"_users","authentication_handlers":["oauth","cookie","default"]}}
//      - /couth/login -> POST /_session
//      - /couth/logout -> DELETE /_session
//      - /couth/signup/:id -> PUT /_users/encodeURIComponent(doc._id)

// from jQ.Couch
// signup: function(user_doc, password, options) {
//   options = options || {};
//   user_doc.password = password;
//   user_doc.roles =  user_doc.roles || [];
//   user_doc.type =  user_doc.type = "user" || [];
//   var user_prefix = "org.couchdb.user:";
//   user_doc._id = user_doc._id || user_prefix + user_doc.name;
//
//   $.couch.userDb(function(db) {
//     db.saveDoc(user_doc, options);
//   });
// },
// login: function(options) {
//   options = options || {};
//   $.ajax({
//     type: "POST", url: this.urlPrefix + "/_session", dataType: "json",
//     data: {name: options.name, password: options.password},
//     beforeSend: function(xhr) {
//         xhr.setRequestHeader('Accept', 'application/json');
//     },
//     complete: function(req) {
//       var resp = $.parseJSON(req.responseText);
//       if (req.status == 200) {
//         if (options.success) options.success(resp);
//       } else if (options.error) {
//         options.error(req.status, resp.error, resp.reason);
//       } else {
//         throw 'An error occurred logging in: ' + resp.reason;
//       }
//     }
//   });
// },
// logout: function(options) {
//   options = options || {};
//   $.ajax({
//     type: "DELETE", url: this.urlPrefix + "/_session", dataType: "json",
//     username : "_", password : "_",
//     beforeSend: function(xhr) {
//         xhr.setRequestHeader('Accept', 'application/json');
//     },
//     complete: function(req) {
//       var resp = $.parseJSON(req.responseText);
//       if (req.status == 200) {
//         if (options.success) options.success(resp);
//       } else if (options.error) {
//         options.error(req.status, resp.error, resp.reason);
//       } else {
//         throw 'An error occurred logging out: ' + resp.reason;
//       }
//     }
//   });
// },
// XXX this isn't needed, if there's a difference it'll have the be handled by the backend
// userDb : function(callback) {
//   $.couch.session({
//     success : function(resp) {
//       var userDb = $.couch.db(resp.info.authentication_db);
//       callback(userDb);
//     }
//   });
// },
// session: function(options) {
//       options = options || {};
//       $.ajax({
//         type: "GET", url: this.urlPrefix + "/_session",
//         beforeSend: function(xhr) {
//             xhr.setRequestHeader('Accept', 'application/json');
//         },
//         complete: function(req) {
//           var resp = $.parseJSON(req.responseText);
//           if (req.status == 200) {
//             if (options.success) options.success(resp);
//           } else if (options.error) {
//             options.error(req.status, resp.error, resp.reason);
//           } else {
//             throw "An error occurred getting session info: " + resp.reason;
//           }
//         }
//       });
//     },
// saveDoc: function(doc, options) {
//           options = options || {};
//           var db = this;
//           var beforeSend = fullCommit(options);
//           if (doc._id === undefined) {
//             var method = "POST";
//             var uri = this.uri;
//           } else {
//             var method = "PUT";
//             var uri = this.uri + encodeDocId(doc._id);
//           }
//           var versioned = maybeApplyVersion(doc);
//           $.ajax({
//             type: method, url: uri + encodeOptions(options),
//             contentType: "application/json",
//             dataType: "json", data: toJSON(doc),
//             beforeSend : beforeSend,
//             complete: function(req) {
//               var resp = $.parseJSON(req.responseText);
//               if (req.status == 200 || req.status == 201 || req.status == 202) {
//                 doc._id = resp.id;
//                 doc._rev = resp.rev;
//                 if (versioned) {
//                   db.openDoc(doc._id, {
//                     attachPrevRev : true,
//                     success : function(d) {
//                       doc._attachments = d._attachments;
//                       if (options.success) options.success(resp);
//                     }
//                   });
//                 } else {
//                   if (options.success) options.success(resp);
//                 }
//               } else if (options.error) {
//                 options.error(req.status, resp.error, resp.reason);
//               } else {
//                 throw "The document could not be saved: " + resp.reason;
//               }
//             }
//           });
//         },
