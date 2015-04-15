Install dependencies

```
npm install
```

Configuration

edit MySQL connection string in zen.etl.js

edit default.yml


Usage:

1) Extract and generate output files by running:

    node zen.etl.js mysql://<user>:<password>@localhost:3306/zen_live
    
2) To load dojos, edit ````config/default.yml```` then run:

    ./import_all.sh 

    or run individual load* scripts:

    node <load_script_name>

