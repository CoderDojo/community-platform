'user strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var profiles = JSON.parse(fs.readFileSync('./data/profiles.json', 'utf8'));
var plugin = "load-profiles";
var config = require('config');

var pg = require('pg');
var conString = "postgres://postgres:test@127.0.0.1/zen_live";

seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){
    var client = new pg.Client(conString);
    client.connect(function(err){
      if(err){
        console.error('could not connect to postgres', err);
        return done(err);
      }

      function createProfile(profile, cb){
        var query = "INSERT INTO cd_profiles(id, mysql_user_id, role, user_id, mysql_dojo_id) " +
                    "VALUES ('" + profile.id  + "', '" + profile.mysql_user_id + "', " + profile.role + ", '" +
                    profile.user_id + "', '" + profile.mysql_dojo_id + "')";

        client.query(query, function(err, result){
          if(err){
            console.error('error running query', err);
            return cb(err);
          }

          return cb();
        });
      }

      var loadProfiles = function(done){
        async.eachSeries(profiles, createProfile, done);
      }

      async.series([loadProfiles], function(err){
        if(err){
          return done(err);
        }

        client.end();
        done();
      })
    });

  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      throw err;
    } else{
      console.log("complete");
    }   
  });
});