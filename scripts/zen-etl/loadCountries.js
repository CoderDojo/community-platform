'use strict'

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var countries = JSON.parse(fs.readFileSync('./data/countries.json', 'utf8'));
var plugin = "load-countries";
var config = require('config');
var ENTITY_NS = "cd/countries";

var pg = require('pg');
var conString = "postgres://postgres:test@127.0.0.1/zen_live";


function pgEscapeString(str){
  return str.split("'").join("''");
}
seneca.ready(function() {
  seneca.add({ role: plugin, cmd: 'insert' }, function (args, done) {

    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        console.error('could not connect to postgres', err);
        return done(err)
      }


      
      function createCountries(country, cb){
        var query = "INSERT INTO cd_countries(id, continent, alpha2, alpha3, number, country_name)" + 
                    " VALUES (" + "'" + country.id + "'" + ", '" + country.continent + "', '"+  country.alpha2 +  "', '" 
                      + country.alpha3 + "', '" +  country.number + "', '" + pgEscapeString(country.country_name) +  "')";

        client.query(query, function(err, result) {
          if(err) {
            console.error('error running query', err);
            return cb(err);
          }
          
          return cb();
        });
      }

      var loadCountries = function (done) {
        async.eachSeries(countries, createCountries , done);
      };

      async.series([
        loadCountries
      ], function(err){
        if(err){
          return done(err);
        }

        client.end();
        done();
      });

    });
  });
    


  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      throw err;
    } else{
      console.log("complete");
    }   
  });
  
});


