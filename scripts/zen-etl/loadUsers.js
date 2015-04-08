'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
var plugin = "load-users";

var config =  require('config');
var ENTITY_NS = "sys/user";
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


      function createUser(user, cb){
        user.activated = !!user.activated;
        var query = "INSERT INTO sys_user (id, mysql_user_id, username, email, "  +
                    "level, active, banned, ban_reason, \"when\", modified)" + 
                    " VALUES('" + user.uuid + "'," + user.mysql_user_id + ",'" + user.username  + "', '" + 
                    user.email + "'," + user.level +  "," + user.activated + ","  + user.banned + ",'" + 
                    user.ban_reason + "', '" + user.created + "', '" + user.modified + "')";

        client.query(query, function(err, result){
          if(err){
            console.error('error running query', err);
            return cb(err);
          }

          return cb();
        });
      }

      var loadUsers = function(done){
        async.eachSeries(users, createUser, done);
      }

      async.series([loadUsers], function(err){
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
      console.log("users complete");
      process.exit(0);
    }    
  });
});