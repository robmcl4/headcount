var headcountApp = angular.module('headcountApp', [
  'ngRoute',
  'headcountControllers',
  'headcountServices'
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
      .when('/sign_in', {
        templateUrl: '/templates/sign_in.html',
        controller: 'headcountSignIn'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
]);

headcountApp.run(['$rootScope', 'user', function($rootScope, user) {
  // load the user
  window.u = user;
  user.getUser()
    .success(function(u) {
      $rootScope.user = u;
    })
    .failure(function(err) {
      $rootScope.user = null;
    });
}]);