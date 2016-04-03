/**
 * Created by PAVEI on 30/09/2014.
 * Updated by Ross Martin on 12/05/2014
 * Updated by Davide Pastore on 04/14/2015
 * Updated by Michel Vidailhet on 05/12/2015
 * Updated by Rene Korss on 11/25/2015
 *
 * Caching based on
 * http://shvchnko.com/blog/2014/08/22/leveraging-caching-in-ionic-apps/
 */

angular.module('ionicLazyLoadCache', []);

angular.module('ionicLazyLoadCache')

.directive('lazyScroll', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                var origEvent = $scope.$onScroll;
                $scope.$onScroll = function () {
                    $rootScope.$broadcast('lazyScrollEvent');
                    if(typeof origEvent === 'function'){
                      origEvent();
                    }
                };
            }
        };
}])
.directive('imageLazyCached', ['$document', '$timeout', '$ionicScrollDelegate', '$compile',
    function ($document, $timeout, $ionicScrollDelegate, $compile) {
        return {
            restrict: 'E',
            template: '<img></img>',
            replace: true,
            scope: {
                lazyScrollResize: "@lazyScrollResize",
                imageLazySrc: "@imageSrc"
            },
            link: function ($scope, $element, $attributes) {
                if (!$attributes.imageLazyDistanceFromBottomToLoad) {
                    $attributes.imageLazyDistanceFromBottomToLoad = 0;
                }
                if (!$attributes.imageLazyDistanceFromRightToLoad) {
                    $attributes.imageLazyDistanceFromRightToLoad = 0;
                }

                var loader;
                if ($attributes.imageLazyLoader) {
                    loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attributes.imageLazyLoader + '"></ion-spinner></div>')($scope);
                    $element.after(loader);
                }

                $scope.$watch('imageLazySrc', function (oldV, newV) {
                    if(loader)
                        loader.remove();
                    if ($attributes.imageLazyLoader) {
                        loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attributes.imageLazyLoader + '"></ion-spinner></div>')($scope);
                        $element.after(loader);
                    }
                    var deregistration = $scope.$on('lazyScrollEvent', function () {
                        //    console.log('scroll');
                            if (isInView()) {
                                loadImage();
                                deregistration();
                            }
                        }
                    );
                    $timeout(function () {
                        if (isInView()) {
                            loadImage();
                            deregistration();
                        }
                    }, 500);
                });
                var deregistration = $scope.$on('lazyScrollEvent', function () {
                       // console.log('scroll');
                        if (isInView()) {
                            loadImage();
                            deregistration();
                        }
                    }
                );

                function loadImage() {
                    console.log("load image");
                    //Bind "load" event
                    $element.bind("load", function (e) {
                        if ($attributes.imageLazyLoader) {
                            loader.remove();
                        }
                        if ($scope.lazyScrollResize == "true") {
                            //Call the resize to recalculate the size of the screen
                            $ionicScrollDelegate.resize();
                        }
                        $element.unbind("load");
                    });
                    //load from cache
                    loadFromCache();
                }
                function loadFromCache() {
                    console.log("load From cache");
                    if (ImgCache.ready) {
                        ImgCache.isCached($scope.imageLazySrc, function(path, success) {
                            if (success) {
                                // already cached
                                ImgCache.getCachedFileURL($scope.imageLazySrc, function(src, tar){
                                    console.log("get cache file url");
                                    console.log(tar);
                                    console.log(src);
                                    $element[0].src = tar;
                                });
                            } else {
                                // not there, need to cache the image
                                ImgCache.cacheFile($scope.imageLazySrc, function () {
                                    ImgCache.getCachedFileURL($scope.imageLazySrc, function(src, tar){
                                        console.log("get cache file url");
                                        console.log(tar);
                                        console.log(src);
                                        $element[0].src = tar;
                                    });
                                });
                            }
                        });
                        // ImgCache.cacheFile($scope.imageLazySrc, function() {
                        //     console.log("cached!! " + $scope.imageLazySrc);
                        //     ImgCache.getCachedFileURL($scope.imageLazySrc, function(src, tar){
                        //         console.log("get cache file url");
                        //         console.log(tar);
                        //         console.log(src);
                        //         $element[0].src = tar;
                        //     });
                        // }, function() {
                        //     console.error('Could not download image (ImgCache).');
                        //     loader.remove();
                        // });
                    } else {
                        $element[0].src = $scope.imageLazySrc;
                    }
                }
                function isInView() {
                    var clientHeight = $document[0].documentElement.clientHeight;
                    var clientWidth = $document[0].documentElement.clientWidth;
                    var imageRect = $element[0].getBoundingClientRect();
                    return (imageRect.top >= 0 && imageRect.top <= clientHeight + parseInt($attributes.imageLazyDistanceFromBottomToLoad))
                        && (imageRect.left >= 0 && imageRect.left <= clientWidth + parseInt($attributes.imageLazyDistanceFromRightToLoad));
                }

                // bind listener
                // listenerRemover = scrollAndResizeListener.bindListener(isInView);

                // unbind event listeners if element was destroyed
                // it happens when you change view, etc
                $element.on('$destroy', function () {
                    deregistration();
                });

                // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
                $timeout(function () {
                    if (isInView()) {
                        loadImage();
                        deregistration();
                    }
                }, 500);
            }
        };
    }])
    .directive('cachedImage', function($compile) {
    return {
        restrict: 'A',
        scope: {
            image: '@cachedImage',
        },
        link: function($scope, $element, $attr) {
            var inside = angular.element($element[0]);
            var loader;
            $scope.$watch('image', function(newValue, oldValue) {
                if (newValue) {
                    if (ImgCache.ready) {
                        // Check if image is cached
                        ImgCache.isCached($scope.image, function(path, success) {
                            if (success) {
                                // Remove spinner
                                if(loader) loader.remove();
                                if($attr.cacheBackground == "true"){
                                    ImgCache.getCachedFileURL($scope.image, function(src, tar){
                                        inside.css('background-image', 'url("' + tar + '")');
                                    });
                                }else{
                                    ImgCache.getCachedFileURL($scope.image, function(src, tar){
                                        inside.src = tar;
                                    });
                                }
                            } else {
                                download();
                            }
                        });
                    } else {
                        download();
                    }
                }
            });

            function download() {
                console.log("download");
                // Add loading indicator
                if ($attr.cachedLoader) {
                    loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attr.cachedLoader + '"></ion-spinner></div>')($scope);
                    inside.html(loader);
                }
                if (ImgCache.ready) {
                    ImgCache.cacheFile($scope.image, function () {
                        if($attr.cacheBackground == "true"){
                            ImgCache.getCachedFileURL($scope.image, function(src, tar){
                                inside.css('background-image', 'url("' + tar + '")');
                            });
                        }else{
                            ImgCache.getCachedFileURL($scope.image, function(src, tar){
                                inside.src = tar;
                            });
                        }
                        if(loader)  loader.remove();
                    });
                } else {
                    var img = new Image();
                    img.src = $scope.image;

                    img.onload = function() {
                        if(loader)  loader.remove();
                        if($attr.cacheBackground == "true"){
                            inside.css('background-image', 'url("' + $scope.image + '")');
                        }else{
                            inside.src = $scope.image;
                        }
                    };

                    img.onerror = function() {
                        if(loader)  loader.remove();
                    };
                }
            }
        },
    };
});;
