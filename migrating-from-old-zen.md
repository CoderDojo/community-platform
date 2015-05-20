#Current steps to import data from the previous cd platform

*pre breaking down into multiple databases and ES indexes

**Order of steps matters.
 
###1) Restore old platform mysql database from backup
 
###2) Update hard-coded connection string and run:

```node zen.etl.js```

in ```community-platform\scripts\zen-etl``` to generate json dumps from the mysql database
 
Alternatively you can grab some ready-made json dumps and copy them into the ```community-platform\scripts\zen-etl\data``` 
folder before the next step.
 
###3) stop any node processes belonging to the platform
 
###4) In cp-zen-platform run:

```make db-create```

You might need to update postgres and es connection strings in the Makefile
This will create the database schema at the same time dropping any existing tables.
 
###5) In cp-zen-platform run:

```make es-delete-index```

You might need to update postgres and es connection strings in the Makefile
This removes the ES index if it exists.
 
###6) Make any required changes to ```community-platform\scripts\zen-etl\config\default.yml``` and then run
 
```import_all.sh```

in ```community-platform\scripts\zen-etl```. This will import users and dojos and related data from the json dumps in 
the data folder and into the postgresql database
 
###7) In cp-zen-platform run

```./start.sh "scripts/add-geonames-data.js" development```

This will reverse geocode dojos and fill in geo data related fields admin1-4 codes and names, city, country, region, etc.
 
###8) In cp-zen-platform run

```./start.sh "scripts/generate-slugs.js" development```

This will generate the urls for dojos e.g. /ie/waterford/waterford/my-downtown-dojo
 
###9) In cp-dojos-service run

```./start.sh scripts/es-index-dojos-data.js development```

This will index the dojos in ES
 
###10) In cp-countries-service run

```./start.sh scripts/countries-import.js development```

then

```./start.sh "scripts/geonames-import.js --country=no-country" development```
```./start.sh "scripts/geonames-import.js --country=IE" development```

... and whichever other countries you need you can also run

```./start.sh "scripts/geonames-import.js --country=all" development```

but beware of the time it will take to complete

This will import all the geonames data required to select places, etc. it also index all the geonames data in ES

Note: don't run the geonames import before running es-index-dojos-data.js as it will create the index without adding the custom analyzer required for dojo indexing.

