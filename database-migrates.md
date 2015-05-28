#How to do make database changes

To handle data migrations we use a Postgrator migration tool. You can find out more infos about it at: https://github.com/rickbergfalk/postgrator

Each cp-*-service which uses postgresql has a directory `migrations` in `scripts/database/pg` directory, which will always contain a `001.do.init-db.sql` file
where lies the initial version of the schema. 

The 001.do.init-db.sql will run at system setup and will create your database initial schema.

If you need to do make any database schema changes, you do so by creating a migration sql file as follows:

* Create another *.sql file under the `migrations` directory. 

* The file name need to follow this convention: [version].[action].[optional-description].sql See the details bellow: 

	* Version must be a number, but you may start and increment the numbers in any way you'd like.

	* Action must be "do" (we won't support rollbacks, so "undo" is not an option for action)

	* Optional-description can be a label or tag to help keep track of what happens inside the script. Descriptions should not contain periods.

Here is an example:

* create `002.do.add-test-column.sql` file in `scripts/database/pg/migrations` directory;

* the script contains the following:

```sql
DO $$ 
	BEGIN
		BEGIN
			ALTER TABLE cd_dojos ADD COLUMN test_column1 character varying;
		EXCEPTION
			WHEN duplicate_column THEN RAISE NOTICE 'column test_column1 already exists in cd_dojos.';
		END;
		BEGIN
			ALTER TABLE cd_dojos ADD COLUMN test_column2 character varying;
		EXCEPTION
			WHEN duplicate_column THEN RAISE NOTICE 'column test_column2 already exists in cd_dojos.';
		END;
	END;
$$
```

* this script adds two new columns, only if they don't already exists, otherwise it will just display an error saying the columns are already in there.

* to apply this changes to the DB schema you have to run the migration script in that service, like this:

`./start.sh development scripts/migrate-psql-db.js`

* this applies only the changes that haven't been applied yet to the schema (see the Postgrator documentation for more informations).