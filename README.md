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

* cp-users-service[https://github.com/CoderDojo/cp-users-service]: Users microservice
* cp-countries-service[https://github.com/CoderDojo/cp-countries-service]: Countries microservice
* cp-dojos-service[https://github.com/CoderDojo/cp-dojos-service]: Dojos microservice


## Database setup

The latest version of the platform runs on PostgreSQL so you need to have a PostgreSQL server available. 9.3.x is the preferred version.

With the default configuration, core services will expect a PostgreSQL server running locally on the default port (postgres:test@127.0.0.1:5432/cd-zen-platform-development).

* create an empty database cd-zen-platform-development (use pgAdmin III to connect to the server and create the empty database)
* in the cp-zen-platform repository run:
```
node scripts/insert-test-users
```
* in the cp-zen-platform repository run:
```
make db-create
make db-populate
```
ensure `psql` command is available before running the above

## Elasticsearch (1.4+)
https://www.elastic.co/downloads/elasticsearch

### Indexing

Whenever entities are created/updated or removed, they are indexed in elasticsearch. All entities are stored within one 
single index which default name is ``cd-zen-platform-development``.

The configuration for the ES cluster are in ``cp-*-service/config/default.yml`` for each service.

### Mappings

Search mappings are defined in ``cp-*-service/es-options.js``.

### Strings

Strings are sometime mapped as non analyzed:

```
{
	type: 'string',
	index: 'not_analyzed'
}
```
This is to disable the default string analyzer which splits strings for indexing. Our ids contain dashes. When 
elasticsearch analyses ids, it becomes impossible to search on ids fields that are analyzed. Hence we disable the analyzer.

## Data import

The above restores countries and dojos data from sql dumps. Alternatively, countries data can be imported from the geonames.org, and dojos from the mysql database (previos zen platform).

### Import countries and geonames

* in the cp-countries-service repository run:
```
node scripts/countries-import.js
node scripts/geonames-import.js --country=no-country
node scripts/geonames-import.js --country=IE
... more countries
```
* in the community-platform repository run:
```
cd scripts/zen-etl
node zen.etl.js
```
to dump mysql data to json files
* in in the community-platform repository run:
```
cd scripts/zen-etl
sh import_all.sh
```
to import dojos, users, and related data into the postgresql database
* in the cp-zen-platform repository run:
```
node scripts/add-geonames-data.js
```
to resolve / reverse geocode coordinates of the existing dojos and add geonames data to dojos (place, administrative areas)

### Index dojos in elasticsearch

* in the cp-dojos-service repository run:
```
node scripts/es-index-dojos-data.js
```



## Running the platform

In the cp-countries-services repository, cd into the `countries` directory and run `npm start`.

Also in the cp-dojos-services repository, cd into the `dojos` directory and run `npm start`.

Lastly, in the cp-zen-platform repository, run `npm-start`.


## More information

Please see readme files in each of the repositories above for further info.






