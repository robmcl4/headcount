var headcountApp = angular.module('headcountApp', ['angularMoment']);


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
  $scope.when = now;

  $scope.submit = function() {
    console.log('Submitting!');
  }

});

headcountApp.directive('datetimePickerRounded', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $(element).find('input').attr('ng-model');
      var default_ = scope[model];
      $(element).datetimepicker({defaultDate: default_});
      scope[model] = $(element).find('input').val();
    }
  }
})
