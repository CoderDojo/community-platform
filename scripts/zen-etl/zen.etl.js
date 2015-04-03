var mysql = require('mysql');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var uuid = require('node-uuid');

var statements = {}, queries = {};

var connString = process.argv[2] ? process.argv[2] : "mysql://root@127.0.0.1/zen_live"

console.log("DB: ", connString);

//SQL statemennts
statements.users =  "SELECT UUID() as uuid, id as mysql_user_id, username," + 
                        "email, level,activated," +
                        "banned ,ban_reason,last_ip," + 
                        "last_login ,created," +
                        "modified FROM zen_live.users";
                        
statements.agreements = "SELECT UUID() as uuid, user_id AS mysql_user_id, full_name, ip_address," + 
                            " timestamp, agreement_version FROM zen_live.charter_agreement;";

statements.profiles = "SELECT UUID() as uuid , user_id AS mysql_user_id, role, dojo FROM `zen_live`.`user_profiles`;"

statements.usersDojos = "SELECT UUID() as id, user_id AS mysql_user_id, dojo_id AS mysql_dojo_id, owner FROM zen_live.user_dojos;"

statements.countries = "SELECT UUID() as id, continent, alpha2, alpha3, number, country_name FROM zen_live.countries";

statements.dojos = "SELECT UUID() as uuid, id as mysql_dojo_id, name, creator, created, verified_at," + 
                " verified_by, verified, need_mentors, stage, time, country," + 
                " location, coordinates, notes, email, website, twitter," + 
                " google_group, eb_id, supporter_image, deleted, " + 
                "deleted_by, deleted_at, private, url_slug FROM zen_live.dojos";

statements.logins = "SELECT * FROM zen_live.user_autologin;";

statements.loginAttempts = "SELECT * FROM zen_live.login_attempts;";

statements.sessions = "SELECT * FROM zen_live.ci_sessions;";



var connection = mysql.createConnection(connString);

connection.connect();

_.forEach(statements, function(v, k){
  var execQuery  = function(cb){
    connection.query(v, function(err, data, fields) {
      if (err){
        return cb(err);
      }

      return cb(null, data); 
    });
  }

  queries[k] = execQuery; 
});




//users - extract, transform and write file
async.parallel(queries, function(err, results) {
  if(err){
    throw err;
  }

  var newAgreements = _.map(results.agreements, function(agreement){
    var user =  _.findWhere(results.users, {mysql_user_id: agreement.mysql_user_id});
    if(user){
      agreement.user_id = user.uuid;
    } else {
      agreement.user_id = "";
      console.log("[agreements] No user found for: ", agreement);
    }

    agreement.id = agreement.uuid;
    delete agreement.uuid;

    return agreement;
  });

  var newProfiles = _.map(results.profiles, function(profile){
    var user =  _.findWhere(results.users, {mysql_user_id: profile.mysql_user_id});
    if(user){
      profile.user_id = user.uuid;  
    } else {
      profile.user_id = "";
      console.log("[profiles] No user found for: ",profile);
    }

    if(!profile.mysql_dojo_id){
      profile.mysql_dojo_id = "";
    }

    profile.id = profile.uuid;
    delete profile.uuid;

    return profile;
  });

  var newDojos = _.map(results.dojos, function(dojo){
    if(dojo.created == "0000-00-00 00:00:00"){
      dojo.created = "-infinity";
    }

    if(!dojo.deleted_at){
      dojo.deleted_at = "-infinity";
    }

    if(!dojo.verified_at){
      dojo.verified_at = "-infinity";
    }


    dojo.id = dojo.uuid;
    delete dojo.uuid;

    return dojo; 
  });

  var newUsers = _.map(results.users, function(user){
    if(user.created == "0000-00-00 00:00:00"){
      user.created = "-infinity";
    }

    if(user.modified == "0000-00-00 00:00:00"){
      user.modified = "-infinity";
    }

    return user;
  });

  //console.log(results.usersDojos);

  var newUserDojos = _.map(results.usersDojos, function(userDojo){
    var user = _.findWhere(results.users, {mysql_user_id: userDojo.mysql_user_id});
    var dojo = _.findWhere(results.dojos, {mysql_dojo_id: userDojo.mysql_dojo_id});

    if(user){
      userDojo.user_id = user.uuid;
    } else{
      userDojo.user_id = "";
      console.log("[usersDojos] No user found for: ", userDojo);
    }

    if(dojo){
      userDojo.dojo_id = dojo.id;
    } else {
      userDojo.dojo_id = "";
      console.log("[usersDojos] No dojo found for: ", userDojo);
    }

    return userDojo;
  });

  fs.writeFileSync("./data/countries.json", JSON.stringify(results.countries));

  fs.writeFileSync("./data/usersDojos.json", JSON.stringify(newUserDojos));

  fs.writeFileSync("./data/dojos.json", JSON.stringify(newDojos));

  fs.writeFileSync("./data/profiles.json", JSON.stringify(newProfiles));

  fs.writeFileSync("./data/agreements.json", JSON.stringify(newAgreements));

  fs.writeFileSync("./data/users.json", JSON.stringify(newUsers));

  console.log("complete");
});


connection.end();