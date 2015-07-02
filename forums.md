# Forums

We use [NodeBB](https://nodebb.org/) for both the Adult and Child Forums. There are four main elements to this in the Community Platform:

* the NodeBB installation itself, at the time of writing we are using version 0.7.
* the CoderDojo SSO plugin for NodeBB, this is a plugin for NodeBB that allows a user of the Forum to log in using their Community Platform account. This plugin is located here: [github.com/CoderDojo/nodebb-plugin-sso-coderdojo](https://github.com/CoderDojo/nodebb-plugin-sso-coderdojo)
* the CoderDojo Theme plugin for NodeBB, this plugin is located here: [github.com/CoderDojo/nodebb-theme-coderdojo](https://github.com/CoderDojo/nodebb-theme-coderdojo)
* the OAuth2 support in cp-zen-platform, this allows the SSO plugin to work. This code lives in the [cp-users-service](https://github.com/CoderDojo/cp-users-service)

# Local development

The Forums are external to the main Community Platform, and as such have their own development and deployment lifecycle. To develop CoderDojo SSO and Theme plugins, this is best done locally:

* install NodeBB locally following the instructions [here](https://docs.nodebb.org/en/latest/installing/os.html) or install directly from github.

* git clone the two plugins above somewhere locally, e.g.

```
~/work $ git clone git@github.com:CoderDojo/nodebb-theme-coderdojo.git
~/work $ cd nodebb-theme-coderdojo
~/work/nodebb-theme-coderdojo $ npm install
~/work/nodebb-theme-coderdojo $ npm link .
```

Then to install the plugins to your local NodeBB (assuming you've install NodeBB in `~/work/NodeBB`):

```
~/work/NodeBB $ npm link nodebb-theme-coderdojo
~/work/NodeBB $ ./nodebb restart
```

# Environment Variables & Config Settings

When deploying NodeBB the following environment variables need to be set, and also need to match up on the Community Platform side. The following environment vars are used in the `nodebb-plugin-sso` [library.js] 


* `CODERDOJO_COMMUNITY_PLATFORM` - the base url of the Community Platform, defaults to `http://localhost:8000` for local development
* `CODERDOJO_FORUMS_NAME` - the OAuth2 clientId, needs to match the config in the Community Platform 
* `CODERDOJO_FORUMS_SECRET` - the OAuth2 clientSecret, again needs to match the config in Community Platform

The variables are used in the nodebb-plugin-sso module here:
https://github.com/CoderDojo/nodebb-plugin-sso-coderdojo/blob/c5dfa5aad4ea7c1fa76c6c76fb3eacfc01c4b86b/library.js#L15-L24

and here in the community platform:
https://github.com/CoderDojo/cp-users-service/blob/d51609b9bedb4d88b4eec8514f0331358c3ecf9a/config/config.js#L79

On the cp-zen-platform side, there is config option of node in `options.base`:

https://github.com/CoderDojo/cp-zen-platform/blob/9076bd56d7b0c58312cda0ab0e2c37304c834aa8/web/options.base.js#L53

This is the external url for the Adult Forums.
