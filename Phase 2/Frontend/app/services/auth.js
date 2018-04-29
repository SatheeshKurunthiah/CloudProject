'use strict';

angular.module('myApp').factory('auth', function ($rootScope, $http, $q, API_URL) {
    return {
        setUser: function (user) {
            if (user) {
                localStorage.setItem('bug-user', JSON.stringify(user));
                var getUser = $http.get(API_URL + 'v1/get/user', {
                    params: {
                        email: user.email
                    }
                });
                var saveUser = getUser.then(function (res) {
                    if (res.data.length === 0) {
                        return $http.post(API_URL + 'v1/add/user', {
                            user: {
                                name: user.displayName,
                                email: user.email
                            }
                        });
                    }
                });

                $q.all([getUser, saveUser]).then(function (res) {
                    $rootScope.$broadcast('loggedIn');
                });

            } else {
                window.localStorage.removeItem('bug-user');
                $rootScope.$broadcast('loggedOut');
            }
        },
        getUserName: function () {
            var user = localStorage.getItem('bug-user');
            return user ? JSON.parse(user).displayName : null;
        },
        isLoggedIn: function () {
            var user = localStorage.getItem('bug-user');
            return (user) ? true : false;
        }
    }
});