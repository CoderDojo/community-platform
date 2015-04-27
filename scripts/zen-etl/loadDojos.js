'use strict';

var _ = require('lodash');
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

    function createDojo(dojo, cb) {
      dojo.id$ = dojo.id;
      delete dojo.country;
      delete dojo.id;

      var dojo_ent = seneca.make(ENTITY_NS);
      _.assign(dojo_ent, dojo);

      dojo_ent.save$(cb);
    }

    var loadDojos = function (done) {
      async.eachSeries(dojos, createDojo, done);
    };

    async.series([
      loadDojos
    ], done);

  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err) {
    if(err){
      console.error(err);
      process.exit(1);
    } else{
      console.log('dojos complete');
      process.exit(0);
    }   
  });
  
});
