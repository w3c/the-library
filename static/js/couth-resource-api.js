/*global angular*/

// XXX
//  this is not working out well, instead do this:
//  - remove the templated one
//  - once that works, refactor it into something generic that knows about the list of
//    types that Couth has (these should be loaded separately, let's avoid codegen please)

// possible enhancement
// this could have interceptors for errors (or whatever works)
// http://www.espeo.pl/2012/02/26/authentication-in-angularjs-application
// except that we have 403 for this, and that we should also intercept 409,

angular.module("CouthResourceAPI", [])
    .factory("Specs", function ($http, $q) {
        // we need this to avoid stupid Couch behaviour of returning text/plain errors
        var strictAccept = { headers: { Accept: "application/json" }}
        ,   errorMap = { // XXX Couch may return others
                forbidden:  403
            ,   not_found:  404
            }
        ;
        return {
            list:   function (success, error) {
                var prom = $http.get("/specs/", strictAccept);
                if (success) prom.success(success);
                if (error) prom.error(error);
                return prom;
            }
        ,   read:   function (obj, success, error) {
                var id = angular.isString(obj) ? obj : obj.shortName // XXX need to know what that is
                ,   deferred = $q.defer()
                ,   prom = deferred.promise;
                if (success && !error) prom = prom.then(success);
                else if (success && error) prom = prom.then(success, error);
                $http.get("/specs/" + id, strictAccept)
                     .then(
                         function (result) {
                            if (angular.isString(result.data)) {
                                try { result.data = JSON.parse(result.data); }
                                catch (e) {
                                    result.status = 500;
                                    return deferred.reject(result);
                                }
                            }
                            if (result.data.error) {
                                result.status = errorMap[result.data.error] || 500;
                                return deferred.reject(result);
                            }
                            if (!angular.isString(obj)) {
                                if (result.data._id) obj._id = result.data._id;
                                if (result.data._rev) obj._id = result.data._rev;
                            }
                            return deferred.resolve(result);
                        }
                    ,   function (result) {
                            return deferred.reject(result);
                        }
                );
                return prom;
            }
        ,   create: function (obj, success, error) {
                var deferred = $q.defer()
                ,   prom = deferred.promise;
                if (success && !error) prom = prom.then(success);
                else if (success && error) prom = prom.then(success, error);
                $http.post("/specs/create", obj, strictAccept)
                     .then(
                         function (result) {
                             obj._id = result.data.id;
                             obj._rev = result.headers("x-couch-update-newrev");
                             return deferred.resolve(obj);
                        }
                    ,   function (result) {
                            return deferred.reject(result);
                        }
                );
            }
        ,   update: function (obj, success, error) {
                var deferred = $q.defer()
                ,   prom = deferred.promise;
                if (success && !error) prom = prom.then(success);
                else if (success && error) prom = prom.then(success, error);
                // XXX we need to get this info from somewhere
                $http.put("/specs/" + obj._id, obj, strictAccept)
                     .then(
                         function (result) {
                             obj._rev = result.data.rev;
                             return deferred.resolve(obj);
                        }
                    ,   function (result) {
                            return deferred.reject(result);
                        }
                );
            }
        ,   del:   function (obj, success, error) {
                var prom = $http["delete"]("/specs/" + obj._id, strictAccept);
                if (success) prom.success(success);
                if (error) prom.error(error);
                return prom;
            }
        };
    })
;
