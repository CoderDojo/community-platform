var mysql = require('mysql');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var userStatements = {}, dojoStatement, loginStatement, 
    loginAttemptsStatement, sessionsStatement;

var connString = process.argv[2] ? process.argv[2] : "mysql://root@127.0.0.1/zen_live"

console.log("DB: ", connString);

var userQueries = {};


//SQL statemennts
userStatements.users = "SELECT * FROM zen_live.users;";
userStatements.agreements = "SELECT * FROM zen_live.charter_agreement;";
userStatements.profiles = "SELECT * FROM `zen_live`.`user_profiles`;"
userStatements.usersDojos = "SELECT * FROM zen_live.user_dojos;"

dojoStatement = "SELECT * FROM zen_live.dojos join `zen_live`.`countries` on((`zen_live`.`dojos`.`country` = `zen_live`.`countries`.`alpha2`));";
loginStatement = "SELECT * FROM zen_live.user_autologin;";
loginAttemptsStatement = "SELECT * FROM zen_live.login_attempts;";
sessionsStatement = "SELECT * FROM zen_live.ci_sessions;";



var connection = mysql.createConnection(connString);

connection.connect();

_.forEach(userStatements, function(v, k){
  var execQuery  = function(cb){
    connection.query(v, function(err, data, fields) {
      if (err){
        return cb(err);
      }

      return cb(null, data); 
    });
  }

  userQueries[k] = execQuery; 
});

//Transformers

var tUsersAgreements = function(results){
  _.forEach(results.users, function(v, k){
    var result = _.where(results.agreements, {user_id: v.id});
    var agreements = result ? result : [];
    v.agreements = agreements;
  });
  
}

var tUsersProfiles =  function(results){
  _.forEach(results.users, function(v, k){
    var result = _.where(results.profiles, {user_id: v.id});
    var profiles = result ? result : [];
    v.profiles = profiles;
  });
}

var tUserDojos = function(results){
  _.forEach(results.users, function(v, k){
    var result = _.where(results.usersDojos, {user_id: v.id});
    var usersDojos = result ? result : [];
    v.usersDojos = usersDojos;
  });
}

// Individual query cb
var writeFile = function(filename){
  
  return function(err, data){
    if(err){
      throw err;
    }

    fs.writeFileSync(filename, JSON.stringify(data));
    console.log("%s finished", filename);
  }
}

//users - extract, transform and write file
async.parallel(userQueries, function(err, results) {
  if(err){
    throw err;
  }
  tUsersAgreements(results);
  tUsersProfiles(results);
  tUserDojos(results);

  fs.writeFileSync('./data/users.json', JSON.stringify(results.users));
  console.log("./data/users.json finished");
});


var execIndividualQueries = function(statement){
  return function(cb){
    connection.query(statement, function(err, data, fields) {
      if (err){
        return cb(err);
      }
      return cb(null, data); 
    }); 
  }
}


function execDojoQuery(cb){
  execIndividualQueries(dojoStatement)(cb);
}


function execLoginQuery(cb){
  execIndividualQueries(loginStatement)(cb);
}


function execLoginAttemptsQuery(cb){
  execIndividualQueries(loginAttemptsStatement)(cb);
}


function execSessionQuery(cb){
  execIndividualQueries(sessionsStatement)(cb);
}

execLoginQuery(writeFile("./data/login.json"));
execLoginAttemptsQuery(writeFile("./data/loginAttempts.json"));
execSessionQuery(writeFile("./data/sessions.json"))
execDojoQuery(writeFile("./data/dojos.json"));

connection.end();