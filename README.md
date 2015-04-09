# community-platform
The new CoderDojo Community Platform. This is the main repoisitory for the Community Platform.

## Development environment

Node 0.10.x:
http://nodejs.org/

Global dependencies:
```
npm install -g grunt-cli
npm install -g bower
npm install -g jshint
```

Database server setup:

Mongodb 2.6.x
https://www.mongodb.org/downloads#previous

PostgreSQL 9.3.x
http://www.postgresql.org/download/


To import dojos data from the previous platform a MySQL server is required as well:

MySQL 5.6.x
http://dev.mysql.com/downloads/mysql/

Create/restore Zen MySQL database from a backup file.

See scripts/zen-etl/README.md for instructions on running the data import.

## Repositories

* cp-zen-web[https://github.com/CoderDojo/cp-zen-web]: The main portal, this is publicly accessible zen content, and should be similar to the existing http://zen.coderdojo.com site today.
* cp-zen-platform[https://github.com/CoderDojo/cp-zen-platform]: The main repo for the 'logged in' content, this is the main entry point for all the angular/microservice based plugins.
* cp-core-services[https://github.com/CoderDojo/cp-core-services]: This is where we'll keep the core backend microservices for now (these may be refactored out of here at a later date).

## Running the platform

Make sure you have mongodb installed (not using mms, manual install)

Run mongo by running `mongod`.

In the cp-core-services repository, cd into the `countries` directory and run `npm start`.

Also in the cp-core-services repository, cd into the `dojos` directory and run `npm start`.

Lastly, in the cp-zen-platform repository, run `npm-start`.

## More information

Please see readme files in each of the repositories above for further info.






