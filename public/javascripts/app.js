var headcountApp = angular.module('headcountApp', [
  'ngRoute',
  'headcountControllers'
]);

headcountApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/templates/main.html',
        controller: 'headcountMainPage'
      })
      .when('/charts', {
        templateUrl: '/templates/charts.html',
        controller: 'headcountCharts'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
]);
