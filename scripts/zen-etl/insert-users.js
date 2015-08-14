'use strict';
var _ = require('lodash');
var async = require('async');
var usersData = require('./data/users.json');

var config = {
  'postgresql-store': {
      name: process.env.USERS_DB_NAME || 'phase3-cp-users-development',
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: process.env.POSTGRES_PORT || 5432,
      username: process.env.POSTGRES_USERNAME || 'platform',
      password: process.env.POSTGRES_PASSWORD || 'QdYx3D5y'
  }
}

var seneca = require('seneca')({timeout: 650000});
var role = 'user-data';

seneca.log.info('using config', JSON.stringify(config, null, 4));
seneca.options(config);

seneca.use('postgresql-store', config["postgresql-store"]);

seneca
  .use('user')
  .client({port:10303, pin:'role:cd-profiles,cmd:*'});

seneca.add({ role: role, cmd: 'insert' }, function (args, done) {
  var userpin = seneca.pin({ role: 'user', cmd: '*'});

  var registerusers = function (done) {
    async.eachSeries(usersData, function(user, cb){
      user = _.omit(user, [ 'password', 'new_password_key', 
                            'new_password_requested','new_email', 
                            'new_email_key', 'last_ip', 
                            'last_login', 'created']);

      user.id$ = user.id;
      
      if(user.init_user_type && user.init_user_type.name == "champion"){
        userpin.register(user, function(err, res){
          if (err) return done(err);

          var profileData = {
            userId:   user.id,
            name:     user.name,
            email:    user.email,
            userType: user.init_user_type.name
          };
          seneca.act({role:'cd-profiles', cmd:'save', profile: profileData, timeout: false}, cb);
        });
      } else {
        cb(null);
      }
    }, done);
  };

  async.series([
    registerusers
  ], done);
});

seneca.ready(function() {
  seneca.act({ role: role, cmd: 'insert', timeout: false }, function (err) {
    if (err) {
      console.log('insert user-data failed:', err);
    }
    else {
      console.log('user-data inserted successfully');
    }

    seneca.close(process.exit);
  });
});

