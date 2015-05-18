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
  NProgress.configure({ trickleRate: 0.1, trickleSpeed: 50, showSpinner: false });

  // patch NProgress so it trickles for a minimum amt of time
  (function() {
    var minNP = 300; // in ms
    var oldStart = NProgress.start;
    var oldDone = NProgress.done;

    var lastPressed = +new Date();
    NProgress.start = function() {
      lastPressed = +new Date();
      oldStart();
    }
    NProgress.done = function(cb) {
      var diff = Math.max((+new Date()) - lastPressed, 0);
      var timeToWait = Math.max(minNP - diff, 0);
      setTimeout(function() {
        oldDone();
        if (cb) $rootScope.$apply(cb);
      }, timeToWait);
    }
  })();

  // load the user
  window.u = user;
  user.getUser()
    .success(function(u) {
      $rootScope.user = u;
    })
    .failure(function(err) {
      $rootScope.user = null;
    });

  // set an action to do on log out
  $rootScope.logout = function() {
    NProgress.start();

    function done() {
      NProgress.done(function() {
        $rootScope.user = null;
      });
    }
    user.logout().success(done).failure(done);
  }
}]);