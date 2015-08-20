'use strict';
var _ = require('lodash');
var fs= require('fs');
var async = require('async');
var envvars = require('./migration-vars.env');
var usersData = require('./data/users.json');

_.each(envvars, function(value, key) {
  process.env[key] = value;
});
var today = new Date();
var datetag = (today.getFullYear()).toString()+(today.getMonth()+1)+(today.getDate())+(today.getHours())+((today.getMinutes()<10)?"0"+today.getMinutes():today.getMinutes());
var sflogfile= "./salesforce-users-migration-logfile."+datetag+".txt";
fs.exists(sflogfile, function (exists) {
  if(!exists) fs.closeSync(fs.openSync(sflogfile, 'w'));
});

var accRecType= process.env.SALESFORCE_ACC_RECORDTYPEID;
var iter = 1;

var config = {
  'postgresql-store': {
    name: process.env.USERS_DB_NAME,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD
  },
  salesforce: {
    loginUrl: process.env.SALESFORCE_URL,
    username: process.env.SALESFORCE_USERNAME,
    password: process.env.SALESFORCE_PASSWORD
  }
}

var seneca = require('seneca')({timeout: 650000});
var role = 'user-data';
var userpin;

seneca.log.info('using config', JSON.stringify(config, null, 4));
seneca.options(config);

seneca.use('postgresql-store', config["postgresql-store"]);

seneca
  .use('user')
  .client({port:10303, pin:'role:cd-profiles,cmd:*', type:'tcp'})
  .client({port:10304, pin:'role:cd-salesforce,cmd:*', type:'tcp'});

seneca.ready(function (args, done) {
  userpin = seneca.pin({ role: 'user', cmd: '*'});

  async.eachSeries(usersData, registerUser, function (err) {
    if (err) {
      console.log('insert user-data failed:', err);
    }
    else {
      console.log('user-data inserted successfully');
    }
  //  seneca.close(process.exit);
  });

});

function registerUser(user, cb) {
  var counter = iter++;
  user = _.omit(user, [ 'password', 'new_password_key', 
                        'new_password_requested','new_email', 
                        'new_email_key', 'last_ip', 
                        'last_login', 'created']);

  user.id$ = user.id;
    
  //only register the champions!
  if(user.init_user_type && user.init_user_type.name == "champion"){
    userpin.register(user, function(err, res){
      if (err) return cb(null);

      var profileData = {
        userId:   user.id,
        name:     user.name,
        email:    user.email,
        userType: user.init_user_type.name
      };
      seneca.act({role:'cd-profiles', cmd:'save', profile: profileData, timeout: false}, function(err, res) {
        if(err) return cb(null);
        if(!res) return cb(res);

        var account = {
          PlatformId__c: user.id,
          PlatformUrl__c: 'https://zen.coderdojo.com/dashboard/profile/' + user.id,
          Email__c: user.email || '<nobody@nowhere.com>',
          Name: user.name ||'<nobody>',
          RecordTypeId: accRecType,
          UserType__c: (user.init_user_type) ? user.init_user_type.title : "",
          Migrated__c: 1
        };
        updateSalesForce(account, function(message) { logOutput("("+counter+"/"+usersData.length+"): "+message, sflogfile); });
        setImmediate(cb);
      });
    });
  } else {
    setImmediate(cb);
  }
};

function updateSalesForce(account, cb) {
  seneca.act('role:cd-salesforce,cmd:save_account', {userId: account.PlatformId__c, account: account}, function (err, res){
      if(err) return cb(err);
      if(!res) return cb(account.PlatformId__c+": error saving salesforce account");

      return cb(account.PlatformId__c+": salesforce account sucessfully saved");
    });
};

function logOutput(message, filename) {
  console.log(message);
  fs.appendFile(filename, message+"\n", function(err) {
    if(err) return console.log(err);
  }); 
}

