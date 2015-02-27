var headcountApp = angular.module('headcountApp', []);


headcountApp.controller('recentHeadcount', function($scope, $http) {
  $scope.headcounts = [];
  $http({
    method: 'GET',
    url: '/api/headcount/recent'
  }).success(function(data, status) {
    $scope.headcounts = data;
    console.log(data);
  }).error(function(data, status) {
    console.error('Error occurred: ' + status);
  });
});
