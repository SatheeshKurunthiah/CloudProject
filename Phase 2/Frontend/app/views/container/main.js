'use strict';

angular.module('myApp').controller('MainCtrl', function ($scope, alert, $http, API_URL) {
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
            columns.width(Math.floor(((container.width() - (columnMargin * (columnCount + 1))) / columnCount)) - 20);

            $scope.lists = res;

            $scope.sortableOptions = {
                placeholder: "app",
                connectWith: ".apps-container",
                stop: function (e, ui) {
                    var items = [];
                    for (var i = 0; i < $scope.lists.length; i++) {
                        var logEntry = $scope.lists[i].items.map(function (x) {
                            return x;
                        });
                        items.push(logEntry);
                    }
                    $http.post(API_URL + 'v1/update/tasks', {
                        tasks: items
                    }).then(function (res) {
                        console.log(JSON.stringify(res.data));
                    });
                    console.log(items.length);
                }
            };
        })
        .error(function (err) {
            alert('warning', 'Unable to read data from backend', err);
        })
});