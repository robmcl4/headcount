var headcountControllers = angular.module('headcountControllers', []);


headcountControllers.controller('headcountMainPage', ['$scope', '$http', function($scope, $http) {
  $scope.headcounts = [];
  $http({
    method: 'GET',
    url: '/api/headcount/recent?limit=5',
  }).success(function(data, status) {
    $scope.headcounts = data;
  }).error(function(data, status) {
    console.error('Error occurred: ' + data);
  });

  var now = moment();
  now.minutes(Math.round(now.minutes()/30)*30);
  now.seconds(0);
  now.milliseconds(0);
  $scope.when = now;
  $scope.how_many = null;

  $scope.submit = function() {
    if ($scope.submitting) return;
    $scope.submitting = true;

    var msg = {
      ts: $scope.when.utc().format(),
      how_many: $scope.how_many
    };
    var start = +(new Date());

    function done() {
      var end = +(new Date());
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.headcounts.unshift({
            ts: new Date(msg.ts),
            how_many: msg.how_many
          });
          $scope.headcounts.pop();
          $scope.submitting = false;
        });
      }, Math.max(end-start, 1000));
    }

    $http.post('/api/headcount', msg)
      .success(function() {
        done();
      })
      .error(function(data, status) {
        console.error('Error occurred in submitting headcount');
        console.error(data);
        console.error(status);
        done();
      });
  }

}]);

headcountControllers.controller('headcountCharts',
  ['$scope', '$http', function($scope, $http) {
    $scope.whichDay = 0;

    $scope.updateDailySummary = function() {
      $http.get('/api/headcount/day_summary?day=' + $scope.whichDay)
      .success(function(data, status) {
        charts.drawDailyGraph(data, '#daily-graph');
      })
      .error(function(data, success) {
        console.error('Error occurred in getting summary data');
        console.error(data);
      });
    }

    $scope.watch('whichDay', function(name, old, new_) {
      if (old !== new_) {
        $scope.updateDailySummary()
      }
      console.log(old, new_);
      return new_;
    });

    $scope.updateDailySummary();
  }
]);

headcountControllers.directive('datetimePickerRounded', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/datetime-picker.html',
    replace: true,
    link: function(scope, element, attrs) {
      var defaultDate = scope[attrs.pickerModel];
      var format = 'MM/DD/YYYY hh:mm A'; 
      $(element).datetimepicker({
        format: format,
        defaultDate: defaultDate
      })
      .find('input').val(defaultDate.format(format));

      scope.$watch(attrs.pickerModel, function(old, new_) {
        element.find('input').val(new_.format(format));
        return new_;
      })
      element.on('input dp.change', function() {
        scope.$apply(function() {
          scope[attrs.pickerModel] = element.data('DateTimePicker').date();
        })
      });
    }
  }
});
