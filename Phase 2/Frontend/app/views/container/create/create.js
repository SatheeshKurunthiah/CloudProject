'use strict';

angular.module('myApp').controller('CreateCtrl', function ($scope, alert, $http, API_URL, $state) {
    $scope.isPriorityDropDownOpen = false;
    $scope.data = {
        type: 'task',
        name: '',
        description: '',
        priority: [{
                id: '1',
                name: 'Critical'
            },
            {
                id: '2',
                name: 'Severe'
            },
            {
                id: '3',
                name: 'High'
            },
            {
                id: '4',
                name: 'Medium'
            },
            {
                id: '5',
                name: 'Low'
            }
        ],
        assignee: [{
            id: '1',
            name: 'Not Assigned'
        }, {
            id: '2',
            name: 'User 1'
        }, {
            id: '3',
            name: 'User 2'
        }],
        project: [{
            id: '1',
            name: 'Project 1'
        }, {
            id: '2',
            name: 'Project 2'
        }],
        selectedPriority: {
            id: '4',
            name: 'Medium'
        },
        selectedAssignee: {
            id: '1',
            name: 'Not Assigned'
        },
        selectedProject: {
            id: '1',
            name: 'Project 1'
        }
    };
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