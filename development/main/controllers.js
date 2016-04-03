angular.module('app.controllers', [
    'app.controllers.signup',
    'app.controllers.login',
    'app.controllers.tab',
    'app.controllers.explore',
    'app.controllers.calendar',
    'app.controllers.list',
]);

angular.module('app.controllers.explore')
.controller('exploreCtrl', function($scope) {

});

angular.module('app.controllers.calendar')
.controller('calendarCtrl', function($scope) {

});

angular.module('app.controllers.list')
.controller('listCtrl', function($scope) {

});
