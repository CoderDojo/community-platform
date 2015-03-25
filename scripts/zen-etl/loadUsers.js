'use strict'

var fs = require('fs');
var seneca = require('seneca')({
  timeout: 5 * 1000
});
var async = require('async');

var users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
var plugin = 'load-users';
var config = require('config');

seneca.use('mongo-store', config.db);
seneca.use('user');

seneca.ready(function() {
  var userpin = seneca.pin({role:'user',cmd:'*'});
  var userent = seneca.make('sys/user');

  seneca.add({ role: plugin, cmd: 'register-users' }, function (args, done) {

    function registerUser(user, cb){
      //console.log('registering %s', user.email);
      user.name = user.username;
      userpin.register(user, function(err, out){
        if(err){
          return cb(err);
        }
        else {
          if (!out.ok) {
            console.warn('register user', user.id, 'failed:', out.why);
          }
          return cb();
        }
      });
    }

    function resetUser(user, cb){
      //console.log('resetting %s', user.email);
      userpin.create_reset({email: user.email}, function(err, out){
        if(err){
          return cb(err);
        } else {
          if (!out.ok) {
            console.warn('create reset for user', user.id, 'failed:', out.why);
            return cb();
          }
          userpin.execute_reset({
            token: out.reset.id,
            password: 'test',
            repeat: 'test'
          }, function(err, out){
            if(err){
              return cb(err);
            }
            else {
              if (!out.ok) {
                console.warn('execute reset for user', user.id, 'failed:', out.why);
              }
              return cb();
            }
          })
        }

      })
    }

    function registerUsers(done){
      async.eachLimit(users, 1, registerUser, done);
    }

    function resetUsers(done){
      
      userent.list$(function(err, users){
        async.eachSeries(users, resetUser, done);
      })
    }

    async.series([registerUsers, resetUsers], done);
  });


  seneca.act({ role: plugin, cmd: 'register-users', timeout: false},
    function(err){
      if(err){
        console.error(err);
      } else{
        console.log('complete');
      }
      seneca.close();
    });
});