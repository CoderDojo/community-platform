'use strict';
var _ = require('lodash');
var fs= require('fs');
var async = require('async');
var envvars = require('./migration-vars.env');
var usersData = require('./data/users.json');
var dojosData = require('./data/dojos.json');

_.each(envvars, function(value, key) {
  process.env[key] = value;
});

var today = new Date();
var datetag = (today.getFullYear()).toString()+(today.getMonth()+1)+(today.getDate())+(today.getHours())+((today.getMinutes()<10)?"0"+today.getMinutes():today.getMinutes());
var sflogfile= "./salesforce-dojos-migration-logfile."+datetag+".txt";
fs.exists(sflogfile, function (exists) {
  if(!exists) fs.writeFile(sflogfile);
});

logOutput("--- starting dojo migration(" + new Date() + ") ===\n",sflogfile)
var leadRecType= process.env.SALESFORCE_LEAD_RECORDTYPEID;

var config = {
  salesforce: {
    loginUrl: process.env.SALESFORCE_URL,
    username: process.env.SALESFORCE_USERNAME,
    password: process.env.SALESFORCE_PASSWORD
  },
  'postgresql-store': {
    name:  process.env.DOJOS_DB_NAME,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD
  }
}

var seneca = require('seneca')({timeout: 650000});
var role = 'dojo-data';

seneca.log.info('using config', JSON.stringify(config, null, 4));
seneca.options(config);

seneca.use('postgresql-store', config["postgresql-store"]);

seneca
  .use('user')
  .client({port:10301, pin:'role:cd-dojos,cmd:*', type:'tcp'})
  .client({type: 'tcp', port: 10304, pin: 'role:cd-salesforce,cmd:*'});

seneca.ready(function() {
  async.eachSeries(dojosData, createDojo, function (err) {
    if (err) {
      console.log('insert dojo-data failed:', err);
    }
    else {
      console.log('dojo-data inserted successfully');
    }

    //seneca.close(process.exit);
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
      seneca.act({role: 'cd-dojos', cmd: 'save_dojo_lead', dojoLead: dojoLead}, function(err, res) {        
        if(err) return cb(err);
        if(!res.id) return cb(res);

        if(dojo.creator) {
          var leadObj= {
            verified: dojo.verified || 0,
            verified_by: dojo.verified_by || null,
            dojoLeadId: res.id,
            creator: dojo.creator,
            lead: {
              PlatformId__c: res.id,
              PlatformUrl__c: 'https://zen.coderdojo.com/dashboard/profile/' + res.id,
              RecordTypeId: leadRecType,
              Company: dojo.name || '<no name specified>',
              LastName: dojo.name || '<no name specified>',
              Email: dojo.email || '<nobody@email.com>',
              Phone: dojo.phone || '00000000',
              Time__c: dojo.time  || null,
              Country: (dojo.country) ? dojo.country.countryName : null,
              City: (dojo.place) ? dojo.place.name : null,
              State: (dojo.state) ? dojo.state.toponymName : null,
              Street: dojo.address1 || null,
              Coordinates__Latitude__s: (dojo.coordinates) ? dojo.coordinates.split(',')[0] : null,
              Coordinates__Longitude__s: (dojo.coordinates) ? dojo.coordinates.split(',')[1] : null,
              Notes__c: dojo.notes || null,
              NeedMentors__c: dojo.need_mentors || 0,
              Stage__c: dojo.stage || 0,
              Private__c: dojo.private || 0,
              GoogleGroupURL__c: dojo.google_group || null,
              Website: dojo.website || null,
              Twitter__c: dojo.twitter || null,
              Language__c: 'en_US',
              Deleted__c: dojo.deleted || 0,
              Status: '5. Dojo Listing Created'
            }
          };
          updateSalesForce(leadObj, function(message) { logOutput(message, sflogfile); });
          return cb();
        } else {
          logOutput(leadObj.dojoLeadId + ": not created - no creator", sflogfile);
          return cb();
        }
      });
    }
  }
});

function updateSalesForce(leadObj, cb) {
      
  seneca.act('role:cd-salesforce,cmd:get_account', {accId: leadObj.creator}, function (err, res){
    if(err) return err;
    if(!res.accId) return cb(leadObj.dojoLeadId+": error retrieving champion account");

    leadObj.lead.ChampionAccount__c= res.accId;
    seneca.act('role:cd-salesforce,cmd:save_lead', {userId: leadObj.lead.PlatformId__c, lead: leadObj.lead}, function (err, res){
      if(err) return err;
      if(!res) return cb(leadObj.dojoLeadId+": error saving lead");

      if((leadObj.verified == 1 ) || (leadObj.verified != 1 && leadObj.verified_by != null)) {
        seneca.act('role:cd-salesforce,cmd:convert_lead_to_account', {leadId: res.id$}, function (err, res){
          if(err) return err;
          if(!res) return cb(leadObj.dojoLeadId+": error converting lead to account"); 

          if(leadObj.verified != 1) {
            var account= { Verified__c: 0 }

            seneca.act('role:cd-salesforce,cmd:save_account', {userId: leadObj.dojoLeadId, account: account}, function (err, res){
              if(err) return err;
              if(!res) return cb(leadObj.dojoLeadId+": error saving newly converted account");

              return cb(leadObj.dojoLeadId+": created salesforce lead and converted to account and updated converted account");
            });
          } else {
            return cb(leadObj.dojoLeadId+": created salesforce lead and converted to account");
          }
        });
      } else {
        return cb(leadObj.dojoLeadId+": created salesforce lead");
      }
    });
  });
} 

function logOutput(message, filename) {
  fs.appendFile(filename, message+"\n", function(err) {
    if(err) return console.log(err);
  }); 
}

