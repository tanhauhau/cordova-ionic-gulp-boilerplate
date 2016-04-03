angular.module('app.controllers.login', [])
.controller('LoginController', function($scope, Auth) {
    $scope.user = {};
    $scope.login = function(email, pasword){
        Auth.setAuth({email: email});
    }
});
