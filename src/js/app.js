'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ui.router',
    'ui.bootstrap',
    'ngResource',
    'ngTable',
    'ngAnimate',
    'toaster',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'LocalStorageModule',
    'hljs'
]).
config(['$stateProvider', '$urlRouterProvider', '$provide', 'hljsServiceProvider', function($stateProvider, $urlRouterProvider, $provide, hljsServiceProvider) {
    $urlRouterProvider.otherwise("/home");

        $provide.decorator('$rootScope', ['$delegate', function($delegate){
            Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
                value: function(name, listener){
                    var unsubscribe = $delegate.$on(name, listener);
                    this.$on('$destroy', unsubscribe);
                },
                enumerable: false
            });
            return $delegate;
        }]);

    $stateProvider.state('home',{
        url: '/home',
        controller: 'HomeCtrl',
        templateUrl: 'partials/home.html'
    });

    /* Files */
    $stateProvider.state('settings',{
        url: '/settings',
        controller: 'SettingsCtrl',
        templateUrl: 'partials/settings.html'
    });
    $stateProvider.state('import',{
        url: '/import',
        controller: 'ImportCtrl',
        templateUrl: 'partials/import.html'
    });
    $stateProvider.state('import2',{
        url: '/import2',
        controller: 'Import2Ctrl',
        templateUrl: 'partials/import2.html'
    });

}]);
