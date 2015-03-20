'use strict'

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var dojos = JSON.parse(fs.readFileSync('./data/dojos.json', 'utf8'));
var plugin = "load-dojos";
var config = require('config');
var ENTITY_NS = "cd/dojos";

seneca.use('mongo-store', config.db)

seneca.ready(function() {
  seneca.add({ role: plugin, cmd: 'insert' }, function (args, done) {

    function createDojo(dojo, cb){
      seneca.make$(ENTITY_NS).save$(dojo, function(err, response) {
        if(err){
          return cb(err);
        }

        return cb(null, response);
      });
    }

    var loadDojos = function (done) {
      async.eachSeries(dojos, createDojo , done);
    };

    async.series([
      loadDojos
    ], done);

  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      throw err;
    } else{
      console.log("complete");
    }   
  });
  
});
