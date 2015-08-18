'use strict';
var _ = require('lodash');
var async = require('async');
var usersData = require('./data/users.json');
var dojosData = require('./data/dojos.json');


var config = {
  'postgresql-store': {
      name:  process.env.DOJOS_DB_NAME || 'phase3-cp-dojos-development',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      username: process.env.POSTGRES_USERNAME || 'platform',
      password: process.env.POSTGRES_PASSWORD || 'QdYx3D5y'
  }/*,
  'salesforce-store': {
      host: process.env.DOJOS_DB_NAME || 'https://test.salesforce.com',
      accrectypeid: process.env.DOJOS_DB_NAME || '0121100000051tU',
      leadrectypeid: process.env.DOJOS_DB_NAME || '0121100000050zq'
      username: process.env.DOJOS_DB_NAME || 'damian.beresford@nearform.com',
      password: process.env.DOJOS_DB_NAME || 'Password1234LWccYitGj6losAJLnKdSSGTyL'
  }*/
}

var seneca = require('seneca')({timeout: 650000});
var role = 'dojo-data';

seneca.log.info('using config', JSON.stringify(config, null, 4));
seneca.options(config);

seneca.use('postgresql-store', config["postgresql-store"]);

seneca
  .use('user')
  .client({port:10301, pin:'role:cd-dojos,cmd:*', type:'tcp'});

seneca.ready(function() {
  async.eachSeries(dojosData, createDojo, function (err) {
    if (err) {
      console.log('insert dojo-data failed:', err);
    }
    else {
      console.log('dojo-data inserted successfully');
    }

    seneca.close(process.exit);
  });

  var count = 0;
  function createDojo(dojo, cb) {
    var creatorUserObj = _.findWhere(usersData, {id: dojo.creator});

    if (!creatorUserObj){
      console.log('The creator of the dojo:', dojo.name, '(mysql_id:', dojo.mysql_dojo_id, ') doesn\'t exist...\n' +
        'This causes an error when trying to create the dojo, so this dojo won\'t be created.');
      return cb();
    }

    dojo.id$ = dojo.id;
    dojo.placeName = dojo.location;
    delete dojo.id; 

    dojo = _.omit(dojo, ['country', 'location', 'url_slug'])
    console.log('creating dojo', dojo, '** user', creatorUserObj, '**count', count++);

    seneca.act({role: 'cd-dojos', cmd: 'create', dojo: dojo, user: creatorUserObj, timeout: 65000}, function(err, res){
      console.log('created dojo', dojo.name, err);
      
      if(err) return cb(err);
      if(dojo.verified > 0){
        var verifiedState = res.data$();

        verifiedState.verified = 1;
        res.save$(verifiedState, createDojoLead);
      } else{
        createDojoLead(err, res, true);
      }
    });

    function createDojoLead(err, res, notVerified){
      var createdDojo = res.data$();
      var dojoLead = {};
      dojoLead.user_id = dojo.creator;
      dojoLead.email = creatorUserObj.email;
      dojoLead.currentStep = (notVerified ? 4 : 5);
      dojoLead.application = {};
      dojoLead.completed = true;
      if((dojo.verified == 1) || (dojo.verified != 1 && dojo.verified_by != null)) dojoLead.converted = true;
      seneca.act({role: 'cd-dojos', cmd: 'save_dojo_lead', dojoLead: dojoLead}, cb);
    }
  }
});

