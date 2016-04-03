// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app',
    ['ionic',
     'app.controllers',
     'app.routes',
     'app.auth',
     'app.config',
     'app.storage',

     'app.util.encrypt.aes',
     //3rd party libraries
     'ImgCache',

    ])

.run(function($ionicPlatform, ImgCache) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        //init image cache
        ImgCache.$init();
    });
})
.run(function($rootScope, $state, Auth){
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, fromState, fromParams){
        if (next.needAuthenticate) {
            if(!Auth.isAuth()){
                event.preventDefault();
                $state.go('login');
                return;
            }
        }
    });
    Auth.onAuth(function(authData){
        if (!authData) {
            $state.go('login');
        }
    });
})
.config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
}])
.config(function (ImgCacheProvider) {
    ImgCacheProvider.setOptions({
        debug: true,
        usePersistentCache: true
    });
    ImgCacheProvider.manualInit = true;
});
