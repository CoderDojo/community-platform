'use strict';

var _ = require('lodash');
var async = require('async');
var request = require('request');
var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var config = require('config');

seneca.use('postgresql-store', config["postgresql-store"]);

seneca.ready(function() {

  function run(done) {
    var dojosEntity = seneca.make$('cd/dojos');
    dojosEntity.list$(function(err, response) {
      if(err) return cb(err);
      async.eachSeries(response, function(dojo, cb) {
        if(!dojo.coordinates) return cb();
        var latitude = dojo.coordinates.split(',')[0];
        var longitude = dojo.coordinates.split(',')[1];
        request('http://api.geonames.org/countrySubdivisionJSON?lat='+latitude+'&lng='+longitude+'&level=4&username=davidc', function(err, res, body) {
          if (!err && res.statusCode == 200) {
            var geonamesData = JSON.parse(body);
            dojo.country = {countryName:geonamesData.countryName};
            dojo.state = {toponymName:geonamesData.adminName1};
            dojo.county = {toponymName:geonamesData.adminName2};
            dojo.city = {toponymName:geonamesData.adminName3};
            dojosEntity.save$(dojo, function(err, response) {
              if(err) return cb(err);
              console.log("saved dojo..." + JSON.stringify(response.id + ':' + response.name));
              cb();
            });
          } else {
            return cb(err);
          }
        });
      }, done);
    });
    

  }

  run(function (err) {
    if (err) {
      console.error('error:', err);
      process.exit(1);
    }
    console.log("Done");
    seneca.close();
    process.exit(0);

  });

});