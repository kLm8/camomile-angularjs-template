angular.module('camomileApp.controllers.browse', [
    "ngSanitize",
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.overlayplay"
  ])
  .controller('BrowseCtrl', ['$scope', '$sce', 'Camomile', function ($scope, $sce, Camomile) {

    // browsing stauts
    $scope.browse = this;

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
    // list of annotations in selected medium
    $scope.browse.annotations = [];

    // API videogular
    $scope.browse.API = null;
    $scope.browse.onPlayerReady = function(API) {
      $scope.browse.API = API;
    };

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
          // console.log(layers);
        });
      }, {
        'filter': {
          'id_corpus': $scope.browse.corpus
        }
      });
    };

    // update list of annotations
    var getAnnotations = function () {
      Camomile.getAnnotations(function (err, data) {
        var annotations;
        if (err) {
          annotations = [];
        } else {
          annotations = data;
        }
        // nested in $scope.$apply to make sure a change event is triggered
        $scope.$apply(function () {
          $scope.browse.annotations = annotations;
          // console.log(annotations);
        });
      }, {
        'filter': {
          'id_medium': $scope.browse.medium,
        }
      });
    };

    var groups = new vis.DataSet([]);
    var items = new vis.DataSet([]);

    // create timeline
    var container = document.getElementById('timeline');
    var options = {
      editable: true,
      onAdd: function (item, callback) {
        item.content = prompt('Enter label for new item:', item.content);
        if (item.content != null) {
          callback(item); // send back adjusted new item
        }
        else {
          callback(null); // cancel item creation
        }
      },
      // onMove: function (item, callback) {
      //   if (confirm('Do you really want to move the item to\n' +
      //       'start: ' + item.start + '\n' +
      //       'end: ' + item.end + '?')) {
      //     callback(item); // send back item as confirmation (can be changed)
      //   }
      //   else {
      //     callback(null); // cancel editing item
      //   }
      // },
      // onMoving: function (item, callback) {
      //   if (item.start < min) item.start = min;
      //   if (item.start > max) item.start = max;
      //   if (item.end   > max) item.end   = max;

      //   callback(item); // send back the (possibly) changed item
      // },
      onUpdate: function (item, callback) {
        content = prompt('Edit label:', item.content);
        if (content != item.content && content != null) {
          item.content = content;
          callback(item); // send back adjusted item
        }
        else {
          callback(null); // cancel updating the item
        }
      },

      onRemove: function (item, callback) {
        if (confirm('Remove label "' + item.content + '" ?')) {
          callback(item); // confirm deletion
        }
        else {
          callback(null); // cancel deletion
        }
      },
      showCustomTime: true,
      start: 0,
      min: 0,
      max: 1000*60*10,
      format: {minorLabels: {millisecond:'s[::]SS', second:'m[:]s', minute:'m'}},
      type: 'range',
      showMajorLabels: false,
      snap: null,
      zoomMax: 1000*60*2, // 2 minutes
      zoomMin: 1000,      // 1 second
      maxHeight: '400px',
      minHeight: '200px',
      groupOrder: function (a, b) {
        return a.value - b.value;
      }
    };

    var timeline = new vis.Timeline(container);
    timeline.setOptions(options);
    timeline.setGroups(groups);
    timeline.setItems(items);
    timeline.setCustomTime(0);

    timeline.on('timechange', function (properties) {
      $scope.browse.API.seekTime((properties.time).getTime()/1000);
    });

    timeline.on('timechanged', function (properties) {
    });

    timeline.on('select', function (event, properties) {
      var selection = timeline.getSelection();
      timeline.focus(selection);
    });

    items.on('update', function (event, properties) {
      console.log((properties.data[0].start).getTime()/1000);
      $scope.browse.API.seekTime((properties.data[0].start).getTime()/1000);
    });

    items.on('*', function (event, properties) {
      logEvent(event, properties);
    });

    function logEvent(event, properties) {
      msg = 'event=' + JSON.stringify(event) + ', ' + 'properties=' + JSON.stringify(properties);
      console.log(msg);
    }

    $scope.browse.updateTime = function(currentTime, duration) {
      timeline.setCustomTime(currentTime*1000);
    };

    $scope.browse.updateState = function(state) {
      
    };


    // var wavesurfer = Object.create(WaveSurfer);

    // var wavesurfer_options = {
    //   container: '#waveform',
    //   waveColor: 'violet',
    //   progressColor: 'purple',
    //   loaderColor   : 'purple',
    //   cursorColor   : 'navy'
    // };

    // wavesurfer.on('ready', function () {
    //   var timeline = Object.create(WaveSurfer.Timeline);

    //   timeline.init({
    //       wavesurfer: wavesurfer,
    //       container: "#wave-timeline"
    //   });
    // });

    // // Init wavesurfer
    // wavesurfer.init(wavesurfer_options);
    // wavesurfer.load('./audio.wav');

    // console.log(Camomile.getMediumURL($scope.browse.medium));
    // wavesurfer.load('/media/audio.wav');

    // get corpora on load
    getCorpora();
    // make sure to update corpora on login/logout
    // as different users have access to different corpora
    $scope.$parent.onLogInOrOut(getCorpora);

    // update list of media and layers when selected corpus changes
    $scope.$watch('browse.corpus', function () {
      getMedia();
      getLayers();

      if (window.XMLHttpRequest) xhttp = new XMLHttpRequest();
      else xhttp = new ActiveXObject("Microsoft.XMLHTTP"); // IE

      xhttp.open("GET", "config.xml", false);
      xhttp.send();
      xmlDoc = xhttp.responseXML;

      // console.log(xmlDoc);

      layers = xmlDoc.getElementsByTagName("layer");

      for (var i = 0; i < layers.length; i++) {
        // console.log(layers[i].firstChild.nodeValue);
        for (var j = 0; j < $scope.browse.layers.length; j++) {
          if ($scope.browse.layers[j]['name'] == layers[i].firstChild.nodeValue) {
            groups.add({
              id: parseInt($scope.browse.layers[j]['_id'], 16),
              content: $scope.browse.layers[j]['name']
            });
          }
        };
      };

      timeline.redraw();
    });

    $scope.$watch('browse.medium', function () {
      // console.log(Camomile.getMediumURL($scope.browse.medium));

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

      getAnnotations();
    });

    $scope.$watch('browse.layer', function () {
      items.clear();
      for (var i = 0; i < $scope.browse.annotations.length; i++) {
        // console.log(parseInt($scope.browse.annotations[i]['_id'], 16));

        items.add({
          id: parseInt($scope.browse.annotations[i]['_id'], 16),
          group: parseInt($scope.browse.annotations[i]['id_layer'], 16),
          content: $scope.browse.annotations[i]['data'],
          start: $scope.browse.annotations[i]['fragment']['start']*1000,
          end: $scope.browse.annotations[i]['fragment']['end']*1000
        })
      };

      // timeline.setItems(items_data);
      timeline.setWindow(0, 60*1000);
    });

}]);
