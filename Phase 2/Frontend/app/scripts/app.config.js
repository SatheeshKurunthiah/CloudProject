'use strict';

angular.module('myApp').config(function ($urlRouterProvider, $stateProvider, $httpProvider, API_URL) {

        $urlRouterProvider.otherwise('/');

        var config = {
            apiKey: "AIzaSyCiJAuhSLBnosJZ-lrHs6xfJUkbxGCU54k",
            authDomain: "bugtracker-201402.firebaseapp.com",
            databaseURL: "https://bugtracker-201402.firebaseio.com",
            projectId: "bugtracker-201402",
            storageBucket: "",
            messagingSenderId: "176482627429"
        };
        firebase.initializeApp(config);

        $stateProvider
            .state('header', {
                controller: 'HeaderCtrl'
            })
            .state('selectProject', {
                url: '/',
                templateUrl: '/views/project/project.html',
                controller: 'ProjectCtrl',
                params: {
                    addProject: false
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/views/dashboard/dashboard.html',
                controller: 'DashboardCtrl',
                params: {
                    project: null
                }
            })
            .state('createTask', {
                url: '/create/task',
                templateUrl: '/views/create/create.html',
                controller: 'CreateCtrl'
            })
            .state('deleteTask', {
                url: '/delete/task',
                templateUrl: '/views/delete/delete.html',
                controller: 'DeleteCtrl'
            })
            .state('getTask', {
                url: '/get/task',
                templateUrl: '/views/task/task.html',
                controller: 'TaskCtrl',
                params: {
                    task: null
                }
            });
    })

    .constant('API_URL', 'https://bugtracker-201402.appspot.com/')
    // .constant('API_URL', 'http://localhost:8001/')

    .run(function ($window) {
        var params = $window.location.search.substring(1);

        if (params && $window.opener && $window.opener.location.origin === $window.location.origin) {
            var pair = params.split('=');
            var code = decodeURIComponent(pair[1]);

            $window.opener.postMessage(code, $window.location.origin);
        }
    });