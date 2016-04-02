angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

  
      
    .state('menu', {
      url: '/side-menu21',
      abstract:true,
      templateUrl: 'templates/menu.html'
    })
      
    
      
        
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html'
    })
        
      
    
      
        
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })
        
      
    
      
        
    .state('tabsController.explore', {
      url: '/explore',
      views: {
        'tab1': {
          templateUrl: 'templates/explore.html'
        }
      }
    })
        
      
    
      
        
    .state('tabsController.calendar', {
      url: '/calendar',
      views: {
        'tab2': {
          templateUrl: 'templates/calendar.html'
        }
      }
    })
        
      
    
      
        
    .state('tabsController.list', {
      url: '/list',
      views: {
        'tab3': {
          templateUrl: 'templates/list.html'
        }
      }
    })
        
      
    
      
    .state('tabsController', {
      url: '/tab',
      abstract:true,
      templateUrl: 'templates/tabsController.html'
    })
      
    ;

  // if none of the above states are matched, use this as the fallback
  
  $urlRouterProvider.otherwise('/signup');
  

  

});