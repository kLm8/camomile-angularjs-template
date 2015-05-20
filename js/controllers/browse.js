angular.module('camomileApp.controllers.browse', [
    "ngSanitize",
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
  ])
  .controller('BrowseCtrl', ['$scope', '$sce', 'Camomile', function ($scope, $sce, Camomile) {

    // browsing stauts
    $scope.browse = {};

    // list of corpora available to the user currently logged in
    $scope.browse.corpora = [];
    // selected corpus
    $scope.browse.corpus = undefined;
    // list of media in selected corpus
    $scope.browse.media = [];
    // selected medium
    $scope.browse.medium = undefined;
    // its sources
    $scope.browse.mediumSrc = undefined;
    // list of layers in selected corpus
    $scope.browse.layers = [];
    // selected layer
    $scope.browse.layer = undefined;

    // update list of corpora 
    var getCorpora = function () {
      Camomile.getCorpora(function (err, data) {
        var corpora;
        if (err) {
          corpora = [];
        } else {
          corpora = data;
        }
        // nested in $scope.$apply to make sure a change event is triggered
        $scope.$apply(function () {
          $scope.browse.corpora = corpora;
        });
      });
    };

    // update list of media
    var getMedia = function () {
      Camomile.getMedia(function (err, data) {
        var media;
        if (err) {
          media = [];
        } else {
          media = data;
        }
        // nested in $scope.$apply to make sure a change event is triggered
        $scope.$apply(function () {
          $scope.browse.media = media;
        });
      }, {
        'filter': {
          'id_corpus': $scope.browse.corpus
        }
      });
    };

    // update list of layers
    var getLayers = function () {
      Camomile.getLayers(function (err, data) {
        var layers;
        if (err) {
          layers = [];
        } else {
          layers = data;
        }
        // nested in $scope.$apply to make sure a change event is triggered
        $scope.$apply(function () {
          $scope.browse.layers = layers;
        });
      }, {
        'filter': {
          'id_corpus': $scope.browse.corpus
        }
      });
    };

    var groups = new vis.DataSet([
      {id: 0, content: 'Speech', value: 1},
      {id: 1, content: 'Emotion', value: 2},
    ]);

    // create a dataset with items
    // note that months are zero-based in the JavaScript Date object, so month 3 is April
    var items = new vis.DataSet([
      {id: 0, group: 0, content: 'Charlie', start: 2, end: 10},
      {id: 1, group: 0, content: 'baby', start: 15, end: 20},
      {id: 2, group: 1, content: 'joy', start: 14, end: 15},
      {id: 3, group: 1, content: 'laughter', start: 22, end: 25, style: 'color: red'}
    ]);

    // create visualization
    var container = document.getElementById('visualization');
    var options = {
      // option groupOrder can be a property name or a sort function
      // the sort function must compare two groups and return a value
      //     > 0 when a > b
      //     < 0 when a < b
      //       0 when a == b
      groupOrder: function (a, b) {
        return a.value - b.value;
      },
      editable: true
    };

    var timeline = new vis.Timeline(container);
    timeline.setOptions(options);
    timeline.setGroups(groups);
    timeline.setItems(items);
    

    // get corpora on load
    getCorpora();
    // make sure to update corpora on login/logout
    // as different users have access to different corpora
    $scope.$parent.onLogInOrOut(getCorpora);

    // update list of media and layers when selected corpus changes
    $scope.$watch('browse.corpus', function () {
      getMedia();
      getLayers();
    });

    $scope.$watch('browse.medium', function () {
      $scope.browse.mediumSrc = [{
        src: $sce.trustAsResourceUrl(Camomile.getMediumURL($scope.browse.medium, "webm")),
        type: "video/webm"
      }, {
        src: $sce.trustAsResourceUrl(Camomile.getMediumURL($scope.browse.medium, "mp4")),
        type: "video/mp4"
      }, {
        src: $sce.trustAsResourceUrl(Camomile.getMediumURL($scope.browse.medium, "ogg")),
        type: "video/ogg"
      }];
    });

  }]);