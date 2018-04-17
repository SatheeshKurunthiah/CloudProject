'use strict';

angular.module('myApp').config(function ($urlRouterProvider, $stateProvider, $httpProvider, API_URL) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('main', {
            url: '/',
            templateUrl: '/views/main.html',
            controller: 'MainCtrl'
        });
})

    .constant('API_URL', 'https://bugtracker-201402.appspot.com/')

    .run(function ($window) {
        var params = $window.location.search.substring(1);

        if (params && $window.opener && $window.opener.location.origin === $window.location.origin) {
            var pair = params.split('=');
            var code = decodeURIComponent(pair[1]);

            $window.opener.postMessage(code, $window.location.origin);
        }
    });