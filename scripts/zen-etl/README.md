Usage:

1) Extract and generate output files by running:

    node zen.etl.js
    
2) To load dojos, edit ````config/default.yml```` then run:

    node loadDojos.js

3) To load test users via the seneca-user plugin, create a file in the data directory called user-test.json with a test user in the following format:

    [  {
    "id": 9999,
    "username": "test1",
    "password": "somepass",
    "email": "test1@example.com",
    "level": 0,
    "activated": 1,
    "banned": 0,
    "ban_reason": null,
    "new_password_key": null,
    "new_password_requested": null,
    "new_email": null,
    "new_email_key": null,
    "last_ip": "104.148.211.137",
    "last_login": "2015-03-12T02:38:35.000Z",
    "created": "2015-03-12T02:38:04.000Z",
    "modified": "2015-03-12T02:38:35.000Z",
    "agreements": [
      {
        "user_id": 1,
        "full_name": "test 1",
        "ip_address": "104.148.211.137",
        "timestamp": "2015-03-12T02:43:12.000Z",
        "agreement_version": 2
      }
    ],
    "profiles": [
      {
        "id": 1,
        "user_id": 9999,
        "role": 1,
        "dojo": null
      }
    ],
    "usersDojos": [
      {
        "user_id": 9999,
        "dojo_id": 1,
        "owner": 1
      }
    ]}]

  
  Then run, ````node loadUsers.json````
  
  The new password created for the user will be ````test````