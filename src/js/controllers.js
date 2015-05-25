'use strict';
var controllerApp = angular.module('myApp.controllers', []);
controllerApp.controller('MainCtrl', ['$scope', '$state', 'LoadingView', '$rootScope', function($scope, $state, LoadingView, $rootScope) {
    var gui = require('nw.gui'),
        win = gui.Window.get();
    $scope.isMaximize = false;

    $scope.minimize = function(){
        win.minimize();
    };
    $scope.close = function(){
        win.close();
    };
    $scope.resize = function(){
        if($scope.isMaximize){
            win.unmaximize();
            $scope.isMaximize = false;
        }else{
            win.maximize();
            $scope.isMaximize = true;
        }
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        LoadingView.hide();
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

    });

    $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){

    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){

    });
}]);
controllerApp.controller('HomeCtrl', ['$scope', 'localStorageService', 'LoadingView', '$state', function($scope, localStorageService, LoadingView, $state) {
    //LoadingView.show();
    var url = localStorageService.get("URL"),
        port = localStorageService.get("PORT"),
        user = localStorageService.get("USER"),
        password = localStorageService.get("PASSWORD");

    if(url===null || user===null || password===null || port===null){
        LoadingView.hide();
        $state.go('settings');
    }

}]);
controllerApp.controller('SettingsCtrl', ['$scope', 'localStorageService', 'LoadingView', 'toaster', function($scope, localStorageService, LoadingView, toaster) {
    $scope.db = {};
    loadData();

    $scope.saveSettings = function(){
        LoadingView.show();
        localStorageService.set("URL", $scope.db.url);
        localStorageService.set("PORT", $scope.db.port);
        localStorageService.set("USER", $scope.db.user);
        localStorageService.set("PASSWORD", $scope.db.password);
        loadData();
        LoadingView.hide();
        toaster.pop('success', 'Save settings', 'Settings have been saved');
    };

    function loadData(){
        $scope.db.url = localStorageService.get("URL");
        $scope.db.port = localStorageService.get("PORT");
        $scope.db.user = localStorageService.get("USER");
        $scope.db.password = localStorageService.get("PASSWORD");
    }
}]);

controllerApp.controller('ImportCtrl', ['$scope', 'LoadingView', '$state', 'localStorageService', 'toaster', '$interval', '$rootScope', function($scope, LoadingView, $state, localStorageService, toaster, $interval, $rootScope) {
    LoadingView.show();
    var url = localStorageService.get("URL"),
        port = localStorageService.get("PORT"),
        user = localStorageService.get("USER"),
        password = localStorageService.get("PASSWORD");

    if(url===null || user===null || password===null || port===null){
        $state.go('settings');
    }



    LoadingView.hide();

    $scope.delimiter = null;
    $scope.jsonToImport = null;
    $scope.showImporter = false;
    $scope.cypherCmd = null;
    var Converter = require("csvtojson").core.Converter,
        fs = require("fs");


    $scope.selectFile = function(){
        getFile(function(f){
            var csvConverter = new Converter({delimiter: $scope.delimiter});
            LoadingView.show();
            var path = f.path;
            var fileStream = fs.createReadStream(path);
            fileStream.pipe(csvConverter);
            csvConverter.on("end_parsed", function(jsonObj){
                console.log("END");
                $scope.$apply(function(){
                    $scope.showImporter = true;
                    $scope.jsonToImport = jsonObj
                });

                LoadingView.hide();
                fileStream.close();
            });
        });
    };

    $scope.execute = function(cypherCmd){
        LoadingView.showProgress();
        console.log($scope.cypherCmd);
        console.log(cypherCmd);
        var neo4j = require('node-neo4j');
        var db = new neo4j("http://" + user + ":" + password + "@" + url + ":" + port);

        var queries = [];
        $scope.jsonToImport.forEach(function(obj){
            var query = cypherCmd;
            Object.keys(obj).forEach(function(key){
                //query = query.replace("${"+key+"}", ((typeof obj[key])==='string') ? "'" + addslashes(obj[key]) + "'" : addslashes(obj[key]));
                query = query.replace("${"+key+"}", "'" + addslashes(obj[key]) + "'" );
            });
            queries.push(query);
        });

        var async = require('async');
        var i=0;
        async.eachSeries(queries, function(query, callback){
            db.cypherQuery(query, function(err, result){
                if(err){
                    console.log("DB-error");
                    callback(err);
                }else{
                    console.log("DB-success");
                    LoadingView.updateProgressBar(i, queries.length);
                    i+=1;
                    callback();
                }
            });
        }, function(err){
            console.log("end - async");
            console.log("error: " + err);
            LoadingView.hideProgress();
        });


    };


    function addslashes( str ) {
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }
}]);


controllerApp.controller('Import2Ctrl', ['$scope', 'LoadingView', '$state', 'localStorageService', 'toaster', '$interval', '$rootScope', function($scope, LoadingView, $state, localStorageService, toaster, $interval, $rootScope) {
    LoadingView.show();
    var url = localStorageService.get("URL"),
        port = localStorageService.get("PORT"),
        user = localStorageService.get("USER"),
        password = localStorageService.get("PASSWORD");

    if(url===null || user===null || password===null || port===null){
        $state.go('settings');
    }
    LoadingView.hide();

    $scope.delimiter = null;
    $scope.jsonToImport = null;
    $scope.showImporter = false;
    $scope.cypherCmd = null;
    $scope.filePath = null;
    var Converter = require("csvtojson").core.Converter,
        fs = require("fs");


    $scope.selectFile = function(){
        getFile(function(f){
            LoadingView.show();
            var path = require('path'),
                pathExtra = require('path-extra'),
                csvPath = f.path,
                jsonPath = pathExtra.tempdir() + path.sep + f.path.substring(f.path.lastIndexOf(path.sep)+1, f.path.lastIndexOf(".")) + ".json",
                fs = require('fs'),
                readStream = fs.createReadStream(csvPath),
                writeStream = fs.createWriteStream(jsonPath),
                csvConverter = new Converter({delimiter: $scope.delimiter});

            console.log(jsonPath);
            readStream.pipe(csvConverter).pipe(writeStream);

            csvConverter.on("end_parsed", function(jsonObj){
                LoadingView.hide();
                $scope.$apply(function(){
                    $scope.showImporter = true;
                    $scope.filePath = jsonPath;
                    $scope.jsonToImport = [];
                    $scope.jsonToImport.push(jsonObj.slice(0, 5));
                });
            });
        });
    };

    $scope.execute = function(cypherCmd){
        console.log("start execute");
        console.log($scope.filePath);
        var fs = require('fs'),
            JSONStream = require('JSONStream'),
            stream = fs.createReadStream($scope.filePath, {encoding: 'utf8'}),
            parser = JSONStream.parse();

        stream.pipe(parser);
        var async = require('async');
        async.waterfall([
            function(callback){
                parser.on('data', function(obj){
                    console.log("data");
                    callback(null, obj);
                });
            },
            function(result, callback){
                console.log(result);
                callback(null, result);
            }
        ], function(err, result){
            console.log("end-waterfall");
        });






        /*LoadingView.showProgress();
        console.log($scope.cypherCmd);
        console.log(cypherCmd);
        var neo4j = require('node-neo4j');
        var db = new neo4j("http://" + user + ":" + password + "@" + url + ":" + port);

        var queries = [];
        $scope.jsonToImport.forEach(function(obj){
            var query = cypherCmd;
            Object.keys(obj).forEach(function(key){
                query = query.replace("${"+key+"}", ((typeof obj[key])==='string') ? "'" + obj[key] + "'" : obj[key]);
            });
            queries.push(query);
        });

        var async = require('async');
        var i=0;
        async.eachSeries(queries, function(query, callback){
            db.cypherQuery(query, function(err, result){
                if(err){
                    console.log("DB-error");
                    callback(err);
                }else{
                    console.log("DB-success");
                    LoadingView.updateProgressBar(i, queries.length);
                    i+=1;
                    callback();
                }
            });
        }, function(err){
            console.log("end - async");
            console.log("error: " + err);
            LoadingView.hideProgress();
        });*/


    };

}]);