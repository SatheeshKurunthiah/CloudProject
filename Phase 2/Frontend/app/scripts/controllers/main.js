'use strict';

angular.module('myApp').controller('MainCtrl', function ($scope, $http, API_URL) {
    $http.get(API_URL)
        .success(function (res) {
            console.log(res);
        })
        .error(function (err) {
            console.log('Error man..')
        })
});