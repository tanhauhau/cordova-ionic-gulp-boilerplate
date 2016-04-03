angular.module('ngMessages')
.directive("ngCompareto", function(){
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=ngCompareto"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});
