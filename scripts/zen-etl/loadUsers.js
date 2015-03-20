'use strict'

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var dojos = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
var plugin = "load-users";
var config = require('config');
var ENTITY_NS = "cd/users";

seneca.use('mongo-store', config.db)

seneca.ready(function() {
  seneca.add({ role: plugin, cmd: 'insert' }, function (args, done) {

    function createUser(user, cb){
      seneca.make$(ENTITY_NS).save$(user, function(err, response) {
        if(err){
          return cb(err);
        }

        return cb(null, response);
      });
    }

    var loadUsers = function (done) {
      async.eachSeries(dojos, createUser , done);
    };

    async.series([
      loadUsers
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
