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
            $scope.backup = jQuery.extend(true, [], res);

            $scope.sortableOptions = {
                placeholder: "app",
                connectWith: ".apps-container",
                stop: function (e, ui) {
                    var dragged = null;
                    var from, to, taskId, items = null;
                    for (var i = 0; i < $scope.lists.length; i++) {
                        var altered = new Set($scope.lists[i].items.map(x => {
                            return x.taskId
                        }));
                        var original = new Set($scope.backup[i].items.map(x => {
                            return x.taskId
                        }));
                        var toDiff = [...altered].filter(x => !original.has(x));
                        var fromDiff = [...original].filter(x => !altered.has(x));
                        if (toDiff.length > 0) {
                            dragged = toDiff[0];
                            to = $scope.backup[i].name;
                        }
                        if (fromDiff.length > 0) {
                            from = $scope.backup[i].name;
                            items = $scope.backup[i].items;
                        }
                    }
                    if(dragged != undefined){
                        $http.put(API_URL + 'v1/update/tasks', {
                            tasks: {
                                taskId: dragged,
                                from: from,
                                to: to,
                            }
                        }).then(function (res) {
                            console.log(JSON.stringify(res.data));
                            $scope.backup = jQuery.extend(true, [], $scope.lists);
                        });
                    }
                }
            };
        })
        .error(function (err) {
            alert('warning', 'Unable to read data from backend', err);
        });
});