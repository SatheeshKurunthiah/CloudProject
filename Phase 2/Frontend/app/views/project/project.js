'use strict';

angular.module('myApp').controller('ProjectCtrl', function ($scope, $rootScope, $state, $q, $stateParams, alert, $http, API_URL) {
    $scope.hideInfo = true;
    $rootScope.$on('projectsLoaded', function (event, project) {
        if ($rootScope.selectedProject) {
            if ($rootScope.addProject === false) {
                $state.go('dashboard', {
                    project: {
                        name: $rootScope.selectedProject
                    }
                });
                return;
            }
        } else {
            $scope.hideInfo = false;
        }
    });

    $scope.data = {
        name: ''
    };
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