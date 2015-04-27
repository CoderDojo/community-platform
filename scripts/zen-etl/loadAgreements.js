'use strict';

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var agreements = JSON.parse(fs.readFileSync('./data/agreements.json', 'utf8'));
var plugin = "load-agreements";
var config = require('config');

var ENTITY_NS = "cd/agreements"
var _ = require("lodash");

seneca.use('postgresql-store', config['postgresql-store']);

seneca.ready(function(){
  seneca.add({role: plugin, cmd: 'insert'}, function(args, done){

    function createAgreemnt(agreement, cb){
      agreement.id$ = agreement.id;
      delete agreement.id;

      var agreement_ent = seneca.make(ENTITY_NS);
      _.assign(agreement_ent, agreement);

      agreement_ent.save$(cb);
    }

    var loadAgreements = function(done){
      async.eachSeries(agreements, createAgreemnt, done);
    };

    async.series([
      loadAgreements
    ], done);
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