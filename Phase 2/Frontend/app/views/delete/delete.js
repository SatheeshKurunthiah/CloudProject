'use strict';

angular.module('myApp').controller('DeleteCtrl', function ($scope, $rootScope, $q, alert, $http, API_URL, $state) {
    var processTasks = function (data) {
            var getItemsByName = function (name, arr) {
                var result = arr.find(item => item.name == name);
                return result != undefined ? result.items : [];
            };

            var tasks = []
            data.forEach(function (column) {
                column.items.forEach(item => tasks.push(item));
            }, this);

            $scope.backlogList = tasks;
        },
        waitForProjectLoading = $q((resolve, reject) => {
            if (!$rootScope.selectedProject) {
                $rootScope.$on('projectsLoaded', function (event, project) {
                    resolve();
                });
            } else {
                resolve();
            }
        }),
        loadTask = waitForProjectLoading.then(function () {
            return $http.get(API_URL + 'v1/get/tasks', {
                params: {
                    user: 'dummy_user_1',
                    project: $rootScope.selectedProject
                }
            });
        });

    $q.all([waitForProjectLoading, loadTask]).then(function (res) {
        processTasks(res[1].data);
    });

    var columns = angular.element(document.getElementsByClassName("apps-container")),
        container = angular.element(document.querySelector('#tasksContainer')),
        columnCount = columns.length,
        columnMargin = 10;
    columns.width(Math.floor(((container.width() - (columnMargin * (columnCount + 1))) / (columnCount)) - 50));

    $scope.deleteTasks = function () {
        var items = $scope.deleteList.map(function (x) {
            return {
                id: x.taskId
            };
        });

        $http.delete(API_URL + 'v1/delete/tasks', {
            params: {
                tasks: items
            }
        }).then(function (res) {
            console.log(JSON.stringify(res.data));
            $state.go('dashboard', {
                project: {
                    name: $rootScope.selectedProject
                }
            });
        });
    };

    $scope.sortableOptions = {
        placeholder: "app",
        connectWith: ".apps-container"
    };

    $scope.backlogList = [];
    $scope.deleteList = [];
});