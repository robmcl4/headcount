var services = angular.module('headcountServices', []);

services.factory('user', ['$http', function($http) {
  return {

    getUser: function() {
      // load the user if there is one
      var user = localStorage.user && JSON.parse(localStorage.user);
      return {
        success: function(cb) {
          if (user) {
            cb({
              username: user.username,
              is_admin: user.is_admin,
              user_id: user.user_id
            });
          }
          return this;
        },
        failure: function(cb) {
          if (!user) {
            cb('no user');
          }
          return this;
        }
      }
    },


    login: function(username, password) {
      var req = $http({
        method: 'POST',
        url: '/api/users/token',
        data: {
          username: username,
          password: password,
          grant_type: 'password'
        }
      });
      return {
        success: function(cb) {
          req.success(function(data, status) {
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
              user.user_id = data.user_id;
              user.username = data.username;
              user.is_admin = data.is_admin;
              localStorage.user = JSON.stringify(user);
              cb();
            })
            .error(function(data, status) {
              console.error('Error in retreiving user ' + status);
            });
          });
          return this;
        },
        failure: function(cb) {
          req.error(function(data, status) {
            cb();
          });
        }
      }
    },

    logout: function() {
      delete localStorage.user;
      return {success: function(cb) {cb();},
              failure: function() {}};
    }
  }
}]);