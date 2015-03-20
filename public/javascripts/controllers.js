var headcountControllers = angular.module('headcountControllers', []);


headcountControllers.controller('headcountMainPage', ['$scope', '$http', function ($scope, $http) {
    var recentCountLimit = 5;

    $scope.headcounts = [];
    $http({
        method: 'GET',
        url: '/api/headcount/recent?limit=' + recentCountLimit,
    }).success(function (data, status) {
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
                        ts: new Date(msg.ts),
                        initials: msg.initials,
                        how_many: msg.how_many
                    });
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
        $scope.whichDay = 0;

        $scope.updateDailySummary = function (whichDay) {
            $http.get('/api/headcount/day_summary?day=' + whichDay)
                .success(function (data, status) {
                    charts.drawDailyGraph(data, '#daily-graph');
                })
                .error(function (data, success) {
                    console.error('Error occurred in getting summary data');
                    console.error(data);
                });
        };

        $scope.watch('whichDay', function (name, old, new_) {
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
            element.on('input', function () {
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
