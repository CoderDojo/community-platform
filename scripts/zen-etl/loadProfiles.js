'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var profiles = JSON.parse(fs.readFileSync('./data/profiles.json', 'utf8'));
var plugin = "load-profiles";
var config = require('config');
var ENTITY_NS = "cd/profiles";

var _ = require("lodash");

seneca.use('postgresql-store', config['postgresql-store']);

seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){

    function createProfile(profile, cb){
      profile.id$ = profile.id;
      delete profile.id;

      var profile_ent = seneca.make$(ENTITY_NS);
      _.assign(profile_ent, profile);

      profile_ent.save$(cb);

    }

    var loadProfiles = function(done){
      async.eachSeries(profiles, createProfile, done);
    };

    async.series([
      loadProfiles
      ], done);


  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      console.log(err);
      process.exit(1);
    } else{
      console.log("profiles complete");
      process.exit(0);
    }    
  });
});