'use strict';

angular.module('myApp').controller('TaskCtrl', function ($scope, $state, $q, $stateParams, alert, $http, API_URL) {
    if ($stateParams.task == undefined) {
        $state.go('dashboard');
        return;
    }
    var priority = [
        'Critical',
        'Severe',
        'High',
        'Medium',
        'Low'
    ];
    var getComments = function (data) {
        var index = 1,
            comments = [],
            groups = data.reduce(function (row, item) {
                var mon = item.time.split(' ').splice(1, 1) + ' ' + item.time.split(' ').splice(3, 1);
                (row[mon]) ? row[mon].data.push(item): row[mon] = {
                    group: String(mon),
                    data: [item]
                };
                return row;
            }, {}),

            commentsGrouped = Object.keys(groups).map(function (k) {
                return groups[k];
            });

        commentsGrouped.forEach(function (item) {
            comments.push({
                time: item.group,
                isTimeline: true
            });
            item.data.sort(function (a, b) {
                if (a.order > b.order) return -1;
                if (a.order < b.order) return 1;
                return 0;
            });
            item.data.forEach(function (comment) {
                if (index % 2 == 0) {
                    comment.isRight = true;
                } else {
                    comment.isLeft = true;
                }
                comments.push(comment);
                index += 1;
            })
        }, this);

        return comments;
    };
    var getUsers = $http.get(API_URL + 'v1/get/user');

    $q.all([getUsers]).then(function (res) {
        var priorities = [],
            users = [],
            index = 1;

        priority.forEach(function (pri) {
            priorities.push({
                id: index,
                name: pri
            });
            index += 1;
        }, this);

        index = 2;
        users.push({
            id: 1,
            name: 'Not Assigned'
        });
        res[0].data.forEach(function (pro) {
            users.push({
                id: index,
                name: pro.name
            });
            index += 1;
        }, this);

        $scope.data = {
            id: $stateParams.task.taskId,
            name: $stateParams.task.name,
            description: $stateParams.task.description,
            assignee: users,
            priority: priorities,
            comments: getComments($stateParams.task.comments),
            comment: '',
            selectedPriority: priorities.find(x => x.name == $stateParams.task.priority),
            selectedAssignee: users.find(x => x.name == $stateParams.task.assignee),
        };
    });

    var input = angular.element(document.getElementsByClassName("input"));
    input.focus(function (event) {
        $(event.target).parent().addClass("focus");
    });

    $scope.onAddComment = function (data) {
        $http.post(API_URL + 'v1/add/comment', {
            comment: {
                id: data.id,
                user: $stateParams.task.assignee,
                comment: data.comment
            }
        }).then(function (res) {
            $http.get(API_URL + 'v1/get/comments', {
                    params: {
                        taskId: $scope.data.id
                    }
                })
                .success(function (res) {
                    $scope.data.comments = getComments(res);
                    $scope.data.comment = '';
                })
                .error(function (err) {
                    alert('warning', 'Unable to read data from backend', err);
                });
        });
    };
});