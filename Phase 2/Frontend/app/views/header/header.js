'use strict';

angular.module('myApp')
    .controller('HeaderCtrl', function ($scope, $state, $rootScope, $q, $http, API_URL, auth) {
        $scope.auth = {
            isAuthenticated: auth.isLoggedIn()
        };
        $scope.isPriorityDropDownOpen = false;
        var waitForLogin = $q(function (resolve, reject) {
                if (auth.isLoggedIn())
                    resolve();
                else
                    reject();
            }),
            updateProjectsList = function (data) {
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
            },
            getProject = waitForLogin.then(function () {
                return $q(function (resolve, reject) {
                    $http.get(API_URL + 'v1/get/project', {
                        params: {
                            user: auth.getUserName()
                        }
                    }).then(function (res) {
                        resolve(res.data);
                    });
                });
            }),
            loadProject = getProject.then(function (res) {
                if (res.length > 0) {
                    $rootScope.selectedProject = res[0].name;
                    $rootScope.$broadcast('projectsLoaded', res[0].name);
                    updateProjectsList(res);
                } else {
                    $scope.isProjectAvailable = false;
                    $rootScope.$broadcast('projectsLoaded', null);
                }
            });

        $q.all([waitForLogin, getProject, loadProject]);

        $rootScope.$on('projectCreated', function (event, project) {
            $http.get(API_URL + 'v1/get/project', {
                params: {
                    user: auth.getUserName()
                }
            }).then(function (res) {
                updateProjectsList(res.data);
                $rootScope.selectedProject = project;
            });
        });

        $scope.onLogin = function () {
            var provider = new firebase.auth.GoogleAuthProvider();

            firebase.auth().signInWithPopup(provider).then(function (result) {
                var token = result.credential.accessToken;
                auth.setUser(result.user);
                $scope.auth = {
                    isAuthenticated: auth.isLoggedIn()
                };
                $q.all([waitForLogin, getProject, loadProject]).then(function () {
                    if ($rootScope.selectedProject !== undefined) {
                        $state.go('dashboard', {
                            project: {
                                name: $rootScope.selectedProject
                            }
                        });
                    }
                });
            }).catch(function (error) {
                alert('error', error.message)
            });
        };

        $scope.onLogout = function () {
            firebase.auth().signOut().then(function () {
                auth.setUser(null);
                $scope.auth = {
                    isAuthenticated: auth.isLoggedIn()
                };
                if ($state.current.name === 'dashboard') {
                    $state.reload();
                } else {
                    $state.go('dashboard', {
                        project: {
                            name: $rootScope.selectedProject
                        }
                    });
                }
            }).catch(function (error) {
                alert('error', error.message)
            });
        };

        $scope.onTrackerClick = function () {
            $http.get(API_URL + 'v1/get/project', {
                params: {
                    user: auth.getUserName()
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