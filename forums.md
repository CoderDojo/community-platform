# Forums

We use [NodeBB](https://nodebb.org/) for both the Adult and Child Forums. There are four main elements to this in the Community Platform:

* the NodeBB installation itself, at the time of writing we are using version 0.7.
* the CoderDojo SSO plugin for NodeBB, this is a plugin for NodeBB that allows a user of the Forum to log in using their Community Platform account. This plugin is located here: [github.com/CoderDojo/nodebb-plugin-sso-coderdojo](https://github.com/CoderDojo/nodebb-plugin-sso-coderdojo)
* the CoderDojo Lavender Theme plugin for NodeBB, this plugin is located here: [github.com/CoderDojo/nodebb-theme-cd-lavender](https://github.com/CoderDojo/nodebb-theme-cd-lavender)
* the OAuth2 support in cp-zen-platform, this allows the SSO plugin to work. This code lives in the [cp-users-service](https://github.com/CoderDojo/cp-users-service)

# Local development

The Forums are external to the main Community Platform, and as such have their own development and deployment lifecycle. To develop CoderDojo SSO and Theme plugins, this is best done locally:

* git clone the theme somewhere locally, e.g.

```
~/work $ git clone git@github.com:CoderDojo/nodebb-theme-cd-lavender.git
~/work $ cd nodebb-theme-cd-lavender
~/work/nodebb-theme-cd-lavender $ npm install
~/work/nodebb-theme-cd-lavender $ npm link .
```

* git clone the sso plugin somewhere locally, e.g.

```
~/work $ git clone git@github.com:CoderDojo/nodebb-plugin-sso-coderdojo.git
~/work $ cd nodebb-plugin-sso-coderdojo
~/work/nodebb-theme-cd-lavender $ npm install
~/work/nodebb-theme-cd-lavender $ npm link .
```

* git clone NodeBB, and link plugin and theme

```
~/work $ git clone -b v0.7.x https://github.com/NodeBB/NodeBB.git
~/work $ cd NodeBB
~/work/NodeBB $ npm install
~/work/NodeBB $ npm link nodebb-theme-cd-lavender
~/work/NodeBB $ npm link nodebb-plugin-sso-coderdojo
```

* copy coderdojo setup data.

```
~/work/NodeBB $ cp ./node_modules/nodebb-theme-cd-lavender/install/data/* ./install/data
~/work/NodeBB $ ./nodebb setup
~/work/NodeBB $ ./nodebb start
```

* choose theme using admin page

```
http://localhost:4567/admin
Appearance >> Themes >> <Use Coder Dojo Lavender Theme>
Restart NodeBB (either from admin Dashboard >> Restart or terminal ./nodebb restart)
```

* upload logo using admin page

```
http://localhost:4567/admin
Site Logo >> Upload Logo
Logo can be found at nodebb-theme-cd-lavender/static/images/logo.png
```
* other suggested admin settings

```
http://localhost:4567/admin
Settings >> General >> Site Tite: forum
Setting >> General >> Browser Title: CoderDojoBB
Settings >> User >> Allow local registration: disabled
Settings >> User >> Allow local login: disabled (make sure sso plugin is working first, or you could lock yourself out!)
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

## Screenshot

[![Home View](http://i.imgur.com/1DYWILY.png)](http://i.imgur.com/1DYWILY.png)