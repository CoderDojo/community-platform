'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var dojos = JSON.parse(fs.readFileSync('./data/dojos.json', 'utf8'));
var plugin = "load-dojos";
var config = require('config');
var ENTITY_NS = "cd/dojos";

seneca.use('postgresql-store', config['postgresql-store']);


seneca.ready(function() {
  seneca.add({ role: plugin, cmd: 'insert' }, function (args, done) {

    function createDojo(dojo, cb){
      dojo.id$ = dojo.id;
      delete dojo.country;
      delete dojo.id;
      seneca.make(ENTITY_NS).save$(dojo, function(err, dojo){
        if(err){
          return cb(err);
        }

        return cb();
      });     
    }

    var loadDojos = function (done) {
      async.eachSeries(dojos, createDojo , done);
    };

    async.series([
      loadDojos
    ], function(err){
      if(err){
        return done(err);
      }
      done();
    });

  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      console.log(err);
      process.exit(1);
    } else{
      console.log("dojos complete");
      process.exit(0);
    }   
  });
  
});
