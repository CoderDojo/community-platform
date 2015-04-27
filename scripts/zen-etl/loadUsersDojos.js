'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var _ = require('lodash');
var usersDojos = JSON.parse(fs.readFileSync('./data/usersDojos.json', 'utf8'));
var plugin = "load-usersdojos";

var config = require('config');
var ENTITY_NS = "cd/usersdojos";

seneca.use('postgresql-store', config['postgresql-store']);

seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){
   
    function createUsersDojos(userDojo, cb){
      userDojo.id$ = userDojo.id;

      delete userDojo.id;

      var user_dojo_ent = seneca.make(ENTITY_NS);
      _.assign(user_dojo_ent, userDojo);

      user_dojo_ent.save$(cb);
    }

    var loadUsersDojos = function(done){
      async.eachSeries(usersDojos, createUsersDojos, done);
    };

    async.series([
      loadUsersDojos
    ], done);

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