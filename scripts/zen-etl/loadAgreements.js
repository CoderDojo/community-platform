'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var agreements = JSON.parse(fs.readFileSync('./data/agreements.json', 'utf8'));
var plugin = "load-agreements";
var config = require('config');
var pg = require('pg');

var conString = config.postgresql.connstring;

function pgEscapeString(str){
  return str.split("'").join("''");
}
seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){
    var client = new pg.Client(conString);

    client.connect(function(err){
      if(err){
        console.error('could not connect to postgres', err);
        return done(err);
      }

      function createAgreemnt(agreement, cb){
        var query = 'INSERT INTO cd_agreements(mysql_user_id, full_name, ip_address, "timestamp", agreement_version, user_id, id)' + 
                    " VALUES(" + agreement.mysql_user_id + ",'" + pgEscapeString(agreement.full_name) + "', '" +  agreement.ip_address + "', '" +
                    agreement.timestamp + "', '" + agreement.agreement_version + "', '"  +  agreement.user_id + "', '" +
                    agreement.id + "')";

        client.query(query, function(err, result){
          if(err){
            console.error('error running query', err);
            return cb(err);
          }

          return cb();
        });
      }

      var loadAgreements = function(done){
        async.eachSeries(agreements, createAgreemnt, done);
      }

      async.series([loadAgreements], function(err){
        if(err){
          return done(err);
        }

        client.end();
        done();
      })
    });
  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      console.log(err);
      process.exit(1);
    } else{
      console.log("agreements complete");
      process.exit(0)
    }   
  });

});
