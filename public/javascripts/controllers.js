var headcountApp = angular.module('headcountApp', []);


headcountApp.controller('recentHeadcount', ['$scope', '$http', function($scope, $http) {
  $scope.headcounts = [];
  $http({
    method: 'GET',
    url: '/api/headcount/recent'
  }).success(function(data, status) {
    $scope.headcounts = data;
  }).error(function(data, status) {
    console.error('Error occurred: ' + status);
  });

}]);


headcountApp.controller('enterHeadcount', function($scope) {
  var now = moment();
  now.minutes(Math.round(now.minutes()/30)*30);
  now.seconds(0);
  now.milliseconds(0);
  $scope.when = now;

  $scope.submit = function() {
    $scope.when = 'foobar';
  }

});

headcountApp.directive('datetimePickerRounded', function() {
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
