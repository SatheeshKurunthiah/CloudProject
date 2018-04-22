'use strict';

angular.module('myApp').controller('CreateCtrl', function ($scope, $q, alert, $http, API_URL, $state) {

    var getProject = $http.get(API_URL + 'v1/get/project', {
        params: {
            user: 'dummy_user_1'
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
                name: pro
            });
            index += 1;
        }, this);

        index = 2;
        users.push({
            id: 1,
            name: 'Not Assigned'
        })
        res[1].data.forEach(function (pro) {
            users.push({
                id: index,
                name: pro
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

        $scope.isPriorityDropDownOpen = false;
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

    $scope.onDropDownClick = function (event) {
        var container = angular.element(document.querySelector('#priority-drop-down'));
        if (!$scope.isPriorityDropDownOpen) {
            container.addClass('dropdown-menu-open');
        } else {
            container.removeClass('dropdown-menu-open');
        }
        $scope.isPriorityDropDownOpen = !$scope.isPriorityDropDownOpen;
    };

    $scope.onCreateTask = function (data) {
        $http.post(API_URL + 'v1/create/tasks', {
            task: {
                name: data.name,
                description: data.description,
                type: data.type,
                project: data.selectedProject.name,
                priority: data.selectedPriority.name,
                assignee: data.selectedAssignee.name
            }
        }).then(function (res) {
            console.log(JSON.stringify(res.data));
            $state.go('main');
        });
    }
});