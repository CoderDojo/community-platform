'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var usersDojos = JSON.parse(fs.readFileSync('./data/usersDojos.json', 'utf8'));
var plugin = "load-usersdojos";

var config = require('config');
var ENTITY_NS = "cd/usersdojos";
var pg = require('pg');
var conString = config.postgresql.connstring;

seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){
    var client = new pg.Client(conString);

    client.connect(function(err){
      if(err){
        console.error('could not connect to postgres', err);
        return done(err);
      }

      function createUsersDojos(userDojo, cb){
        var query = "INSERT INTO cd_usersdojos (mysql_user_id, mysql_dojo_id, owner, user_id, dojo_id, id)" + 
        "VALUES (" + "'" + userDojo.mysql_user_id + "','" + userDojo.mysql_dojo_id + "', '" + userDojo.owner + 
          "', '" + userDojo.user_id + "', '" + userDojo.dojo_id + "','" +  userDojo.id +  "')";

        client.query(query, function(err, result){
          if(err){
            console.error('error running query', err);
            return cb(err);
          }

          return cb();
        });
      }

      var loadUsersDojos = function(done){
        async.eachSeries(usersDojos, createUsersDojos, done);
      }

      async.series([
        loadUsersDojos
      ], function(err){
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
      console.log(err);
      process.exit(1);
    } else{
      console.log("users dojos complete");
      process.exit(0);
    }   
  });
});