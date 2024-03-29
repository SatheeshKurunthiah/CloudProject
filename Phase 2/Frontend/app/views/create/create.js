'use strict';

angular.module('myApp').controller('CreateCtrl', function ($scope, $rootScope, $q, alert, $http, API_URL, $state, auth) {

    var getProject = $http.get(API_URL + 'v1/get/project', {
        params: {
            user: auth.getUserName()
        }
    });
    var getUsers = $http.get(API_URL + 'v1/get/user');
    var priority = [
        'Critical',
        'Severe',
        'High',
        'Medium',
        'Low'
    ];

    $q.all([getProject, getUsers]).then(function (res) {
        var projects = [],
            users = [],
            priorities = [],
            index = 1;

        res[0].data.forEach(function (pro) {
            projects.push({
                id: index,
                name: pro.name
            });
            index += 1;
        }, this);

        index = 2;
        users.push({
            id: 1,
            name: 'Not Assigned'
        });
        res[1].data.forEach(function (pro) {
            users.push({
                id: index,
                name: pro.name
            });
            index += 1;
        }, this);
        index = 1;
        priority.forEach(function (pri) {
            priorities.push({
                id: index,
                name: pri
            });
            index += 1;
        }, this);

        $scope.data = {
            type: 'task',
            name: '',
            description: '',
            priority: priorities,
            assignee: users,
            project: projects,
            selectedPriority: priorities[3],
            selectedAssignee: users[0],
            selectedProject: projects[0]
        };
    });

    var input = angular.element(document.getElementsByClassName("input"));
    input.focus(function (event) {
        $(event.target).parent().addClass("focus");
    });

    $scope.onCreateTask = function (data) {
        $http.post(API_URL + 'v1/create/tasks', {
            task: {
                name: data.name,
                description: data.description,
                type: data.type,
                project: data.selectedProject.name,
                priority: data.selectedPriority.name,
                createdBy: auth.getUserName(),
                assignee: data.selectedAssignee.name
            }
        }).then(function (res) {
            console.log(JSON.stringify(res.data));
            $state.go('dashboard', {
                project: {
                    name: $rootScope.selectedProject
                }
            });
        });
    }
});