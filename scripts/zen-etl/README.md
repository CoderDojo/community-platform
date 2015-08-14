#Brief overview

This folder contains scripts to migrate from the old db to the new one.
The steps to do this are as follows

	1. Install dependencies with `npm install`
	2. Configure the scripts with the right information (the mysql login details & db, the postgres info can be set with env variables)
	3. Create json dump files from the mysql db by runnning `./create-dump.sh`
	4. Upload that data to the new postgres db, by running `./upload-dump.sh`

Thats all folks! 

##Install dependencies:

Simply run the following:

```
npm install
```

##Configuration:

Edit the connectionConf variable at the top of the zen.etl.js file with the information relevant to your mysql db.

You can set the following env variables to connect to the correct dbs for inserting the postgres data

USERS_DB_NAME
DOJOS_DB_NAME
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_USERNAME
POSTGRES_PASSWORD

Otherwise these will default to the correct information for development.

##Create the json dump files

Run the following:
```
./create-dump.sh
```
This will create two files, dojos.json and users.json

##Upload the json dumps

Run the following:
```
./upload-dump.sh
```