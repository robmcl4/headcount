var services = angular.module('headcountServices', []);

services.factory('user', ['$http', function($http) {
  var ret = {};

  function storedUser() {
    return ( localStorage.user && JSON.parse(localStorage.user) ) || null;
  }

  ret.getUser = function() {
    // load the user if there is one
    var user = storedUser();
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
  };


  ret.login = function(username, password) {
    var req = $http({
      method: 'POST',
      url: '/api/users/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: $.param({
        username: username,
        password: password,
        grant_type: 'password'
      })
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
  };

  ret.logout = function() {
    var user = storedUser();
    // if we're not logged in anyway, ignore...
    if (!user) {
      return {success: function(cb) {cb();},
              failure: function() {}};
    }

    delete localStorage.user;

    // if we don't have a refresh token, just delete our user (above) and move on
    if (!user.refresh_token) {
      return {success: function(cb) {cb();},
              failure: function() {}};
    }

    // if we have a refresh token, try to remove it
    var req = $http({
      method: 'DELETE',
      url: '/api/users/revoke_refresh_token',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.access_token
      },
      data: {
        refresh_token: user.refresh_token
      }
    });
    return {
      success: function(cb) {
        req.success(function(data, status) {
          cb();
        });
      },
      failure: function(cb) {
        req.failure(function(data, status) {
          cb('Failed to remove refresh token');
        });
      }
    }

  }

  return ret;

}]);