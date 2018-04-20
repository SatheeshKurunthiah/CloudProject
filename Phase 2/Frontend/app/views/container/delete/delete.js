'use strict';

angular.module('myApp').controller('DeleteCtrl', function ($scope, alert, $http, API_URL, $state) {
    $http.get(API_URL + 'v1/get/tasks', {
            params: {
                user: 'dummy_user_1'
            }
        })
        .success(function (res) {
            var getItemsByName = function (name, arr) {
                var result = arr.find(item => item.name == name);
                return result != undefined ? result.items : [];
            };

            var columns = angular.element(document.getElementsByClassName("apps-container"));
            var container = angular.element(document.querySelector('#tasksContainer'));

            var columnCount = columns.length;
            var columnMargin = 10;
            columns.width(Math.floor(((container.width() - (columnMargin * (columnCount + 1))) / (columnCount)) - 50));

            var tasks = []
            res.forEach(function(column) {
                column.items.forEach(item => tasks.push(item));
            }, this);

            $scope.backlogList = tasks;
            $scope.deleteList = [];

            $scope.sortableOptions = {
                placeholder: "app",
                connectWith: ".apps-container"
              };

            $scope.deleteTasks = function(){
                var items = $scope.deleteList.map(function (x) {
                    return x.taskId;
                });

                $http.delete(API_URL + 'v1/delete/tasks', {
                    params: {
                        tasks: items
                    }
                }).then(function (res) {
                    console.log(JSON.stringify(res.data));
                    $state.go('main');
                });
            };
        })
        .error(function (err) {
            alert('warning', 'Unable to read data from backend', err);
        })
});