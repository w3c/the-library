/*global angular */

function NavCtrl ($scope, $rootScope, $location) {
    $rootScope.pathActive = function (path) {
        return ($location.path().substr(0, path.length) === path) ? "active" : "";
    };
}

function SpecsCtrl ($scope, $rootScope, Specs) {
    $scope.specs = Specs.list().rows;
}

angular.module("the-library", ["the-library-api"])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", { templateUrl: "/templates/home.html" })
            .when("/app/specs/", { controller: SpecsCtrl, templateUrl: "/templates/specs.html" })
            .otherwise({ redirectTo: "/" });
    })
;


// this from the github multiverse project

//
// function BranchesCtrl ($scope, $rootScope, Branches) {
//     $scope.branches = Branches.query({ user: $rootScope.user, repo: $rootScope.repo });
// }
//
// function BranchCtrl ($scope, $rootScope, $routeParams, Contents) {
//     var branch = $routeParams.branch.replace(/\|/g, "/");
//     $scope.branch = branch;
//     $scope.contents = Contents.query({ user: $rootScope.user, repo: $rootScope.repo, branch: branch });
// }
//
// function FileCtrl ($scope, $rootScope, $routeParams, Contents) {
//     var branch = $routeParams.branch.replace(/\|/g, "/")
//     ,   file = $routeParams.file
//     ;
//     $scope.branch = branch;
//     $scope.file = file;
//     $scope.contents = Contents.get({ user: $rootScope.user, repo: $rootScope.repo, branch: branch, path: file });
// }
//

// templates

// <iframe src='data:{{file | mediaType}};base64,{{contents.data.content}}' style='width: 100%; height: 100%'></iframe>

// <ul>
//   <li ng-repeat='branch in branches.data'><a href='{{ branch.name | unslash }}/'>{{branch.name}}</a></li>
// </ul>


// <h1>On branch: {{branch}}</h1>
//
// <ul>
//   <li ng-repeat='content in contents.data'><a href='{{branch | unslash}}/{{ content.path }}/'>[{{content.type}}] {{content.path}}</a></li>
// </ul>
