'use strict';

angular.module('myApp').controller('ProjectCtrl', function ($scope, $rootScope, $state, $q, $stateParams, alert, $http, API_URL, auth) {
    $scope.hideInfo = true;
    $scope.data = {
        name: ''
    };
    $scope.auth = {
        isAuthenticated: auth.isLoggedIn()
    };
    var redirectToDashboard = function () {
        if ($rootScope.selectedProject && $rootScope.addProject === undefined) {
            $state.go('dashboard', {
                project: {
                    name: $rootScope.selectedProject
                }
            });
            // setTimeout(function () {
            //     $state.go('dashboard', {
            //         project: {
            //             name: $rootScope.selectedProject
            //         }
            //     });
            // }, 200);
            return;
        } else {
            $scope.hideInfo = false;
        }
    };
    $rootScope.$on('projectsLoaded', function (event) {
        redirectToDashboard();
    });

    $rootScope.$on('loggedIn', function (event) {
        $scope.auth = {
            isAuthenticated: auth.isLoggedIn()
        }
    });

    $rootScope.$on('loggedOut', function (event) {
        $scope.auth = {
            isAuthenticated: auth.isLoggedIn()
        }
    });

    $scope.onCreateProject = function () {
        $http.post(API_URL + 'v1/create/project', {
            project: {
                name: $scope.data.name
            }
        }).then(function (res) {
            $state.go('dashboard', {
                project: {
                    name: $scope.data.name
                }
            });
            $rootScope.$broadcast('projectCreated', $scope.data.name);
        });
    };

    var input = angular.element(document.getElementsByClassName("input"));
    input.focus(function (event) {
        $(event.target).parent().addClass("focus");
    });
});