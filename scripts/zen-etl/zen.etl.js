var mysql = require('mysql');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var uuid = require('node-uuid');
var geocoder = require('node-geocoder')('google', 'https', {'apiKey':process.env.GEOCODER_API_KEY || 'YOUR_API_KEY'});

var statements = {}, queries = {}, championEmails = [];

var connectionConf = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'zen_dev'
}

var connection = mysql.createConnection(connectionConf);

connection.connect();

//SQL statemennts
statements.users =  "SELECT id as mysql_user_id, username," + 
                        "email, level,activated," +
                        "banned ,ban_reason,last_ip," + 
                        "last_login ,created," +
                        "modified FROM users";
                        
statements.agreements = "SELECT user_id AS mysql_user_id, full_name AS name, ip_address," + 
                            " timestamp, agreement_version FROM charter_agreement;";

statements.usersDojos = "SELECT user_id AS mysql_user_id, dojo_id AS mysql_dojo_id, owner FROM user_dojos;"

statements.countries = "SELECT UUID() as id, continent, alpha2, alpha3, number, country_name FROM countries";

statements.dojos = "SELECT dojos.id as mysql_dojo_id, dojos.name, dojos.creator, dojos.created, dojos.verified_at," + 
                " dojos.verified_by, dojos.verified, dojos.need_mentors, dojos.stage, dojos.time, dojos.country," + 
                " dojos.location, dojos.coordinates, dojos.notes, dojos.email, dojos.website, dojos.twitter," + 
                " dojos.google_group, dojos.eb_id, dojos.supporter_image, dojos.deleted, " + 
                " dojos.deleted_by, dojos.deleted_at, dojos.private, dojos.url_slug, " + 
                " countries.continent, countries.alpha2, countries.alpha3, countries.number as country_number, countries.country_name" +
                " FROM dojos, countries WHERE countries.alpha2 = dojos.country;";


statements.userProfiles = "SELECT * FROM user_profiles;";

statements.logins = "SELECT * FROM user_autologin;";

statements.loginAttempts = "SELECT * FROM login_attempts;";

statements.sessions = "SELECT * FROM ci_sessions;";

statements.dojoWithUsers = "SELECT * FROM dojo_with_user";


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

  var newUserProfiles = _.map(results.userProfiles, function(userProfile){
    var user =  _.findWhere(results.users, {mysql_user_id: userProfile.user_id});
    
    if(user){

      if(userProfile.role === 0){
        if(!user.roles){ 
          user.roles = ['cdf-admin'];
          user.init_user_type = {"title":"Champion", "name": "champion"};
        }
      } else {
        if(!user.roles) user.roles = ['basic-user'];
      }

    }
    return userProfile;
  });

  var newAgreements = _.map(results.agreements, function(agreement){
    var user =  _.findWhere(results.users, {mysql_user_id: agreement.mysql_user_id});
    
    if(user){
      if(!user.id) user.id = uuid.v4();
      agreement.user_id = user.id;
      user.name = agreement.name;
    } else {
      agreement.user_id = null;
      console.log("[agreements] No user found for: ", agreement);
    }

    agreement.id = uuid.v4();

    return agreement;
  });

  var newDojos = _.map(results.dojos, function(dojo){
    var creator = _.findWhere(results.users, {mysql_user_id: dojo.creator});

    if(!creator){
      console.log("[dojos] creator not found for dojo.id: ", dojo.mysql_dojo_id, "Creator ID:", dojo.creator);
    } else {
      if(!creator.init_user_type){
        creator.init_user_type = {"title":"Champion", "name": "champion"};
      }
    }
    if(dojo.created == "0000-00-00 00:00:00"){
      dojo.created = "-infinity";
    }

    if(!dojo.deleted_at){
      dojo.deleted_at = "-infinity";
    }

    if(!dojo.verified_at){
      dojo.verified_at = "-infinity";
    }

    if(creator){
      if(!creator.id) creator.id = uuid.v4();
      dojo.creator = creator.id;
    } else {
      dojo.creator = null;
    }

    dojo.id = uuid.v4();

    return dojo; 
  });

  //console.log(results.usersDojos);

  var newDojoWithUsers = _.map(results.dojoWithUsers, function(dojoWithUser){
    var user = _.findWhere(results.users, {mysql_user_id: dojoWithUser.user_id});
    var dojo = _.findWhere(results.dojos, {mysql_dojo_id: dojoWithUser.dojo_id});

    if(user){
      if(!user.name && dojoWithUser.full_name) user.name = dojoWithUser.full_name;
    }

    return dojoWithUser;
  });

  var newUserDojos = _.map(results.usersDojos, function(userDojo){
    var user = _.findWhere(results.users, {mysql_user_id: userDojo.mysql_user_id});
    var dojo = _.findWhere(results.dojos, {mysql_dojo_id: userDojo.mysql_dojo_id});

    if(user){
      if(!user.id) user.id = uuid.v4();
      userDojo.user_id = user.id;

      if(userDojo.owner === 1){
        if(!user.init_user_type) user.init_user_type = {"title":"Champion", "name": "champion"};
      }
    } else{
      userDojo.user_id = null;
      console.log("[usersDojos] No user found for: ", userDojo);
    }

    if(dojo){
      userDojo.dojo_id = dojo.id;
    } else {
      userDojo.dojo_id = null;
      console.log("[usersDojos] No dojo found for: ", userDojo);
    }

    userDojo.id = uuid.v4();

    return userDojo;
  });

  var newUsers = _.map(results.users, function(user){
    if(user.created == "0000-00-00 00:00:00"){
      user.created = "-infinity";
    }

    if(user.modified == "0000-00-00 00:00:00"){
      user.modified = "-infinity";
    }

    if(!user.id) user.id = uuid.v4();

    user.nick = user.email;

    if(!user.name) user.name = user.username;

    if(user.init_user_type && user.init_user_type.title === "Champion"){
      championEmails.push({email: user.email, name: user.name});
    }

    return user;
  });

  async.eachSeries(newDojos, function iterator(dojo, cb){
    if(!dojo.coordinates) return async.setImmediate(function(){cb(null, dojo)});

    geocoder.reverse({lat:dojo.coordinates.split(',')[0], lon:dojo.coordinates.split(',')[1]}, function(err, res) {
      res = res[0];
      
      if(!res) return async.setImmediate(function(){cb(null, dojo)});

      console.log(res);
      dojo.address1 = (res.streetNumber || '') + ' ' + (res.streetName || '');
      dojo.place = {'name': res.city};
      dojo.state = {"toponymName": res.state};
      dojo.country = {"countryName": res.country, "alpha2": res.countryCode};
      dojo.admin1_code = res.stateCode;
      dojo.admin1_name = res.state;
      async.setImmediate(function(){cb(null, dojo)});
    });
  }, writeFiles)

  function writeFiles(){
    //fs.writeFileSync("./data/countries.json", JSON.stringify(results.countries));

    //fs.writeFileSync("./data/usersDojos.json", JSON.stringify(newUserDojos));

    fs.writeFileSync("./data/dojos.json", JSON.stringify(newDojos));

    //fs.writeFileSync("./data/agreements.json", JSON.stringify(newAgreements));

    fs.writeFileSync("./data/users.json", JSON.stringify(newUsers));

    //fs.writeFileSync("./data/championEmails.json", JSON.stringify(championEmails))

    console.log("complete");
  }
  
});


connection.end();
