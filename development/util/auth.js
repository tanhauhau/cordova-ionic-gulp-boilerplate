;(function() {
'use strict';
angular.module('app.auth', ['app.storage', 'underscore'])
    .factory('Auth', function($localstorage, _) {
        var PROFILE = 'profile';
        function getAuth(){
            return $localstorage.getObject(PROFILE) || {};
        }
        function saveAuth(auth){
            $localstorage.setObject(PROFILE, auth);
        }

        var Auth = {};
        Auth.auth = getAuth();
        Auth.getAuth = function(){
            return Auth.auth;
        };
        Auth.isAuth = function(){
            return !_.isEmpty(Auth.auth);
        };
        Auth.setAuth = function(auth){
            //id, email, username, profile pic, token, fbconnected, goconnected,
            Auth.auth = {};
            if(auth){
                Auth.auth.id = auth.id;
                Auth.auth.email = auth.email;
                Auth.auth.username = auth.username;
                Auth.auth.pic = auth.pic || 'img/icon_profilePic.png';
                Auth.auth.token = auth.token;
                Auth.auth.fbconnected = auth.fbconnected || false;
                Auth.auth.goconnected = auth.goconnected || false;
                Auth.auth.verified = !!auth.verified;
            }
            saveAuth(Auth.auth);

            for (var i = 0; i < Auth._cb.length; i++) {
                Auth._cb[i](Auth.auth);
            }
        };
        Auth.logout = function(){
            Auth.setAuth();
        };
        Auth.username = function(){
            return Auth.auth.username;
        };
        Auth.uid = function(){
            return Auth.auth.id;
        };
        Auth.email = function(){
            return Auth.auth.email;
        };
        Auth.token = function(){
            return Auth.auth.token;
        };
        Auth.profilePic = function(val){
            if(arguments.length == 1){
                Auth.auth.pic = val;
                saveAuth(Auth.auth);
            }else{
                return Auth.auth.pic || 'img/icon_profilePic.png';
            }
        };
        Auth.verified = function(val){
            if(arguments.length == 1){
                Auth.auth.verified = val;
                saveAuth(Auth.auth);
            }else{
                return Auth.auth.verified || false;
            }
        };
        Auth._cb = [];
        Auth.onAuth = function(cb){
            Auth._cb.push(cb);
        }
        return Auth;
    });
})();
