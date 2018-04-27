'use strict';

angular.module('myApp')
    .controller('HeaderCtrl', function ($scope, $state, $rootScope, $q, $http, API_URL) {
        $scope.isAuthenticated = true;
        $scope.isPriorityDropDownOpen = false;
        var getProject = $q(function (resolve, reject) {
            $http.get(API_URL + 'v1/get/project', {
                params: {
                    user: 'dummy_user_1'
                }
            }).then(function (res) {
                resolve(res.data);
            });
        });

        var updateProjectsList = function (data) {
            if (data) {
                var projects = [];
                data.forEach(function (pro) {
                    projects.push(pro.name);
                }, this);
                $scope.data = {
                    projects: projects
                };
                $scope.isProjectAvailable = true;
            }
        };

        $rootScope.$on('projectCreated', function (event, project) {
            $http.get(API_URL + 'v1/get/project', {
                params: {
                    user: 'dummy_user_1'
                }
            }).then(function (res) {
                updateProjectsList(res.data);
                $rootScope.selectedProject = project;
            });
        })

        $q.all([getProject]).then(function (res) {
            if (res[0].length > 0) {
                $rootScope.selectedProject = res[0][0].name;
                $rootScope.$broadcast('projectsLoaded', res[0][0].name);
                updateProjectsList(res[0]);
            } else {
                $scope.isProjectAvailable = false;
                $rootScope.$broadcast('projectsLoaded', null);
            }
        });

        $scope.onTrackerClick = function () {
            $http.get(API_URL + 'v1/get/project', {
                params: {
                    user: 'dummy_user_1'
                }
            }).then(function (res) {
                updateProjectsList(res.data);
                $state.go('dashboard', {
                    project: {
                        name: $rootScope.selectedProject
                    }
                });
                $rootScope.$broadcast('projectsLoaded', $rootScope.selectedProject);
            });
        };

        $scope.onDropDownClick = function (event) {
            var container = angular.element(document.querySelector('#priority-drop-down'));
            if (!$scope.isPriorityDropDownOpen) {
                container.addClass('dropdown-menu-open');
            } else {
                container.removeClass('dropdown-menu-open');
            }
            $scope.isPriorityDropDownOpen = !$scope.isPriorityDropDownOpen;
        };

        $scope.onSelectProject = function (project) {
            $rootScope.selectedProject = project;
            this.onDropDownClick();
            if ($state.current.name === 'dashboard') {
                $state.go('dashboard', {
                    project: {
                        name: $rootScope.selectedProject
                    }
                });
            } else {
                $state.reload();
            }
        };
    });