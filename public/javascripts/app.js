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
      .when('/sign_in', {
        templateUrl: '/templates/sign_in.html',
        controller: 'headcountSignIn'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
]);

headcountApp.run(['$rootScope', '$http', function($rootScope, $http) {
  // load the user if there is one
  $rootScope.user = null;
  if (localStorage.user) {
    var user = JSON.parse(localStorage.user);
    $rootScope.user = {
      user_id: user.id,
      username: user.username,
      is_admin: user.is_admin
    }

    // refresh our knowledge of the user
    $http({
      method: 'GET',
      url: '/api/users/me',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + user.access_token
      }
    })
    .success(function(data, status) {
      $rootScope.user.username = data.username;
      $rootScope.user.user_id = data.user_id;
      $rootScope.user.is_admin = data.is_admin;
    })
    .error(function(data, status) {
      // we are signed out or unauthorized somehow
      if (status === 401) {
        delete localStorage.user
        $rootScope.user = null;
      }
    });

  }
}]);