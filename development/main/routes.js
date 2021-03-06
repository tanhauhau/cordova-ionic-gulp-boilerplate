angular.module('app.routes', [])
.config(function($stateProvider, $urlRouterProvider, DEFAULT_URL) {
    $stateProvider
    .state('signup', {
        url: '/signup',
        controller: 'SignupController',
        templateUrl: 'auth/signup/signup.html'
    })
    .state('login', {
        url: '/login',
        controller: 'LoginController',
        templateUrl: 'auth/login/login.html',
    })
    .state('tabs', {
        url: '/tab',
        abstract: true,
        controller: 'TabController',
        templateUrl: 'tab/tabs.html',
    })
    .state('tabs.explore', {
        url: '/explore',
        views: {
            'tab-explore': {
                templateUrl: 'templates/explore.html'
            }
        }
    })
    .state('tabs.calendar', {
        url: '/calendar',
        views: {
            'tab-calendar': {
                templateUrl: 'templates/calendar.html'
            }
        }
    })
    .state('tabs.list', {
        url: '/list',
        views: {
            'tab-list': {
                templateUrl: 'templates/list.html'
            }
        }
    })
    ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function($injector, $location){
        var Auth = $injector.get("Auth");
        if(Auth.isAuth()){
            if(Auth.verified()){
                return DEFAULT_URL;
            }else{
                return 'verify';
            }
        }else{
            return 'login';
        }
    });
});
