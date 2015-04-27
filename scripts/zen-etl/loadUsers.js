'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
var plugin = "load-users";
var config =  require('config');
var ENTITY_NS = "sys/user";

var _ = require("lodash");

seneca.use('postgresql-store', config['postgresql-store']);

seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){

      function createUser(user, cb){
        user.id$ = user.uuid;

        user = _.omit(user, [ 'password', 'new_password_key', 
                              'new_password_requested','new_email', 
                              'new_email_key', 'last_ip', 
                              'last_login', 'created', 'uuid']);
        
        var user_ent = seneca.make(ENTITY_NS);
        _.assign(user_ent, user);

        user_ent.save$(cb);
      }

      var loadUsers = function(done){
        async.eachSeries(users, createUser, done);
      };

      async.series([loadUsers], done);

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
