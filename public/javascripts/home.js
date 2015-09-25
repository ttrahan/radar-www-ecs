'use strict';
/* jshint camelcase:false*/

var app = angular.module('radar', []);

app.controller('mainCtrl', function ($scope, $log, env_factory, factory) {
  $scope.message = {'type': 'info'};
  $scope.repo = 'shippable/support';
  $scope.accessToken = '';
  $scope.days = 0;
  $scope.daysEnd = 3;
  $scope.indexData = {};
  $scope.state = 'submit';
  $scope.loading = false;
  $scope.log = $log;
  $scope.env = {};
  $scope.apiMessage = '';
  $scope.apiVersion = '';
  $scope.apiBuildnum = '';
  $scope.apiAccessTime = null;
  $scope.fullAPIResponse = false;

  env_factory.get()
    .success(function (data) {
      if (data.NODE_ENV)
        $scope.env.environment = data.NODE_ENV;
      if (data.API_URL)
        $scope.env.api_url = data.API_URL;
      else if (data.API_PORT)
        $scope.env.api_url = 'http://localhost:' + data.API_PORT;
      else
        $scope.env.api_url = 'http://localhost:3001';
      if ($scope.env.environment === 'dev')
        $log.info($scope.env);
      factory.info($scope.env.api_url)
        .success(function (data) {
          $scope.apiVersion = data.version;
          $scope.apiBuildnum = data.buildnumber;
          if (data.message)
            $scope.apiMessage = data.message;
          if (!isNaN(Date.parse(data.time)))
            $scope.apiAccessTime = new Date(data.time).toLocaleTimeString();
        })
        .error(
        function () {
          $scope.message = {
            'type': 'error',
            'text': 'Unable to connect to API!'
          };
        }
      );
    })
    .error(function (reason) {
      $log.error(reason);
    });

  $scope.getIssues =
    function (state) {
      if (checkValid()) {
        $scope.loading = true;
        factory.get($scope.env.api_url, $scope.repo, $scope.accessToken,
          $scope.days, $scope.daysEnd, state)
          .success(
          function (data) {
            checkState(data.state);
            $scope.indexData = data.indexData;
          }
        )
          .error(
          function (reason) {
            $scope.loading = false;
            $log.error(reason);
            $log.error('Trying to access ' + $scope.env.api_url);
            $scope.message = {
              'type': 'error',
              'text': 'Error! Check that you can access the API...'
            };
          }
        );
      }
    };

  $scope.back =
    function () {
      $scope.state = 'submit';
      $scope.indexData = {};
      $scope.message = {};
      $scope.loading = false;
    };

  function checkState(state) {
    if (state === 'open' || state === 'closed') {
      $scope.state = state;
    }
    else {
      if (state === 'accessError') {
        $log.error('Access error');
        $scope.message = {
          'type': 'error',
          'text': 'Please check your access token!'
        };
      }
      else if (state === 'repoError') {
        $log.error('Repo error');
        $scope.message = {'type': 'error', 'text': 'Invalid repo!'};
      }
      else {
        $log.error(state);
        $scope.message = {'type': 'error', 'text': 'Unknown error'};
      }
      $scope.state = 'submit';
      $scope.loading = false;
    }
  }

  function checkValid() {
    if ($scope.accessToken === '') {
      $scope.message = {
        'type': 'error',
        'text': 'Please give your access token!'
      };
      return false;
    }
    else if (isNaN(parseInt($scope.days)) || isNaN(parseInt($scope.daysEnd)) ||
      $scope.daysEnd - $scope.days < 0 ||
      $scope.days < 0 || $scope.daysEnd < 0 ||
      $scope.days % 1 !== 0 || $scope.daysEnd % 1 !== 0) {
      $scope.message = {
        'type': 'error',
        'text': 'Please put a valid range of days!'
      };
      return false;
    }
    else {
      return true;
    }
  }
});

app.factory('factory',
  function ($http) {
    return {
      get: function (url, repo, token, days, daysEnd, state) {
        return $http.get(url +
          '/issues?&repo=' + repo +
          '&token=' + token +
          '&days=' + days +
          '&daysEnd=' + daysEnd +
          '&state=' + state);
      },
      info: function (url) {
        console.log(url);
        return $http.get(url + '/info');
      }
    };
  });

app.factory('env_factory', function ($http) {
  return {
    get: function () {
      return $http.get('/env');
    }
  };
});
