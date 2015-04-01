var mysql = require('mysql');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var userStatements = {}, dojoStatement, loginStatement, 
    loginAttemptsStatement, sessionsStatement, countriesStatement;

var connString = process.argv[2] ? process.argv[2] : "mysql://root@127.0.0.1/zen_live"

console.log("DB: ", connString);

var userQueries = {};


//SQL statemennts
userStatements.users =  "SELECT id as mysql_user_id, username," + 
                        "email, level,activated," +
                        "banned ,ban_reason,last_ip," + 
                        "last_login ,created," +
                        "modified FROM zen_live.users";
                        
userStatements.agreements = "SELECT user_id AS mysql_user_id, full_name, ip_address," + 
                            " timestamp, agreement_version FROM zen_live.charter_agreement;";

userStatements.profiles = "SELECT id , user_id AS mysql_user_id, role, dojo FROM `zen_live`.`user_profiles`;"
userStatements.usersDojos = "SELECT user_id AS mysql_user_id, dojo_id AS mysql_dojo_id, owner FROM zen_live.user_dojos;"

countriesStatement = "SELECT * FROM zen_live.countries";

dojoStatement = "SELECT id as mysql_dojo_id, name, creator, created, verified_at," + 
                " verified_by, verified, need_mentors, stage, time, country," + 
                " location, coordinates, notes, email, website, twitter," + 
                " google_group, eb_id, supporter_image, deleted, " + 
                "deleted_by, deleted_at, private, url_slug FROM zen_live.dojos";

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
      fs.writeFileSync("./data/" + k + ".json", JSON.stringify(data));
      console.log("finished: " + k  + ".json");
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
  // tUsersAgreements(results);
  // tUsersProfiles(results);
  // tUserDojos(results);

  // fs.writeFileSync('./data/users.json', JSON.stringify(results.users));
  // console.log("./data/users.json finished");
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

function execCountriesQuery(cb){
  execIndividualQueries(countriesStatement)(cb);
}

execLoginQuery(writeFile("./data/login.json"));
execLoginAttemptsQuery(writeFile("./data/loginAttempts.json"));
execSessionQuery(writeFile("./data/sessions.json"))
execDojoQuery(writeFile("./data/dojos.json"));
execCountriesQuery(writeFile("./data/countries.json"));

connection.end();