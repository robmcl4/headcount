var headcountControllers = angular.module('headcountControllers', []);


headcountControllers.controller('headcountMainPage', ['$scope', '$http', function ($scope, $http) {
  var recentCountLimit = 5;

  $scope.headcounts = [];
  $http({
    method: 'GET',
    url: '/api/headcount/recent?limit=' + recentCountLimit,
  }).success(function (data, status) {
    data.forEach(function(x) {x.ts = moment(x.ts)});
    $scope.headcounts = data;
  }).error(function (data, status) {
    console.error('Error occurred: ' + data);
  });

  var now = moment();
  now.minutes(Math.round(now.minutes() / 30) * 30);
  now.seconds(0);
  now.milliseconds(0);
  $scope.when = now;
  $scope.how_many = null;

  $scope.submit = function () {
    if ($scope.submitting) return;
    $scope.submitting = true;

    var msg = {
      ts: $scope.when.format(),
      initials: $scope.initials,
      how_many: $scope.how_many
    };
    var start = +(new Date());

    function done() {
      var end = +(new Date());
      setTimeout(function () {
        $scope.$apply(function () {
          $scope.headcounts.unshift({
            ts: moment(msg.ts),
            initials: msg.initials,
            how_many: msg.how_many
          });
          $scope.headcounts.sort(function(a, b) {return b.ts - a.ts;});
          if ($scope.headcounts.length > recentCountLimit) {
            $scope.headcounts.pop();
          }
          $scope.submitting = false;
        });
      }, Math.max(end - start, 1000));
    }

    $http.post('/api/headcount', msg)
      .success(function () {
        done();
      })
      .error(function (data, status) {
        console.error('Error occurred in submitting headcount');
        console.error(data);
        console.error(status);
        done();
      });
  }

}]);

headcountControllers.controller('headcountCharts',
  ['$scope', '$http', function ($scope, $http) {
    $scope.whichDay = 1;

    $scope.updateDailySummary = function updateDailySummary(whichDay) {
      $http.get('/api/headcount/day_summary?day=' + whichDay)
        .success(function (data, status) {
          charts.drawDailyGraph(data, '#daily-graph');
        })
        .error(function (data, success) {
          console.error('Error occurred in getting summary data');
          console.error(data);
        });
    };

    $scope.$watch('whichDay', function (new_, old) {
      if (old !== new_) {
        $scope.updateDailySummary(new_);
      }
      return new_;
    });

    $scope.updateDailySummary($scope.whichDay);
  }
  ]);

headcountControllers.directive('datetimePickerRounded', function () {
  return {
    restrict: 'E',
    templateUrl: '/templates/datetime-picker.html',
    replace: true,
    link: function (scope, element, attrs) {
      var defaultDate = scope[attrs.pickerModel];
      var format = 'MM/DD/YYYY hh:mm A';
      var pattern = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)/i;

      $(element).datetimepicker({
        format: format,
        defaultDate: defaultDate
      })
        .find('input').val(defaultDate.format(format));

      scope.$watch(attrs.pickerModel, function (new_) {
        if (!new_.isValid()) {
          if (new_._i)
            element.find('input').val(new_._i);
        } else {
          element.find('input').val(new_.format(format));
        }
        return new_;
      });
      element.on('dp.change', function () {
        scope.$apply(function () {
          scope[attrs.pickerModel] = element.data('DateTimePicker').date();
        })
      });
      element.on('change', function () {
        scope.$apply(function () {
          var val = element.find('input').val();
          var parsed = moment(val, format, true);
          if (!val.match(pattern)) {
            parsed = moment.invalid();
            parsed._i = val;
          }
          scope[attrs.pickerModel] = parsed;
        })
      });
    }
  }
});


headcountControllers.controller('headcountSignIn', ['$scope', '$http', '$location',
  function($scope, $http, $location) {
    $scope.username = '';
    $scope.password = '';
    $scope.submit = function() {
      $http({
        method: 'POST',
        url: '/api/users/token',
        data: {
          username: $scope.username,
          password: $scope.password,
          grant_type: 'password'
        }
      })
      .success(function(data, status) {
        var user = {
          access_token: data.access_token,
          refresh_token: data.refresh_token
        }
        $http({
          method: 'GET',
          url: '/api/users/me',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + data.access_token
          }
        })
        .success(function(data, status) {
          $scope.$parent.user = {
            user_id: data.user_id,
            username: data.username,
            is_admin: data.is_admin
          }
          user.user_id = data.user_id;
          user.username = data.username;
          user.is_admin = data.is_admin;
          localStorage.user = JSON.stringify(user);
          $location.path('/');
        })
        .error(function(data, status) {
          delete localStorage.user;
        });
      });
    }
  }
]);
