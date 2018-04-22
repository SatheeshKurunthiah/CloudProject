'use strict';

angular.module('myApp').config(function ($urlRouterProvider, $stateProvider, $httpProvider, API_URL) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: '/views/container/main.html',
                controller: 'MainCtrl'
            })
            .state('createTask', {
                url: '/create/task',
                templateUrl: '/views/container/create/create.html',
                controller: 'CreateCtrl'
            })
            .state('deleteTask', {
                url: '/delete/task',
                templateUrl: '/views/container/delete/delete.html',
                controller: 'DeleteCtrl'
            });
    })

    // .constant('API_URL', 'https://bugtracker-201402.appspot.com/')
    .constant('API_URL', 'http://localhost:8001/')

    .run(function ($window) {
        var params = $window.location.search.substring(1);

        if (params && $window.opener && $window.opener.location.origin === $window.location.origin) {
            var pair = params.split('=');
            var code = decodeURIComponent(pair[1]);

            $window.opener.postMessage(code, $window.location.origin);
        }
    });