# Foros

Utilizamos [NodeBB](https://nodebb.org/) para ambos Foros de Mentores y Jovenes. Hay cuatro elementos principales a este en la plataforma de la comunidad:

* la instalación del NodeBB en sí, al momento de escribir estamos usando la versión 0.7.
* el conector CoderDojo SSO para NodeBB, este es un conector para NodeBB que permite a un usuario del foro a loguearse utilizando su cuenta de la Plataforma Comunitaria. Este conector está localizado aquí: [github.com/CoderDojo/nodebb-plugin-sso-coderdojo](https://github.com/CoderDojo/nodebb-plugin-sso-coderdojo)
* el conectore CoderDojo Lavender Theme para NodeBB, este conector está localizado aquí: [github.com/CoderDojo/nodebb-theme-cd-lavender](https://github.com/CoderDojo/nodebb-theme-cd-lavender)
* el soporte OAuth2 en cp-zen-platform, esto permite que el conector SSO funcione. El código reside en [cp-users-service](https://github.com/CoderDojo/cp-users-service)

# Desarrollo local

Los Foros están fuera de la Plataforma Comunitaria principal, y como tal tienen su propio desarrollo y ciclo de vida de desarrollo. Para desarrollar los conectores CoderDojo SSO y Theme, esto es mejor hacerlo localmente:

* clone con git el tema localmente en algún lugar, por ejemplo

```
~/work $ git clone git@github.com:CoderDojo/nodebb-theme-cd-lavender.git
~/work $ cd nodebb-theme-cd-lavender
~/work/nodebb-theme-cd-lavender $ npm install
~/work/nodebb-theme-cd-lavender $ npm link .
```

* clone con git el conector sso localmente en algún lugar, por ejemplo

```
~/work $ git clone git@github.com:CoderDojo/nodebb-plugin-sso-coderdojo.git
~/work $ cd nodebb-plugin-sso-coderdojo
~/work/nodebb-theme-cd-lavender $ npm install
~/work/nodebb-theme-cd-lavender $ npm link .
```

* clone con git el conector write-api localmente en algún lugar, por ejemplo
```
~/work $ git clone git@github.com:CoderDojo/nodebb-plugin-write-api.git
~/work $ cd nodebb-plugin-write-api
~/work/nodebb-plugin-write-api $ npm install
~/work/nodebb-plugin-write-api $ npm link .
```

* clone con git el NodeBB, y una los conectores con los temas

```
~/work $ git clone -b v0.7.x https://github.com/NodeBB/NodeBB.git
~/work $ cd NodeBB
~/work/NodeBB $ npm install
~/work/NodeBB $ npm link nodebb-theme-cd-lavender
~/work/NodeBB $ npm link nodebb-plugin-sso-coderdojo
~/work/NodeBB $ npm link nodebb-plugin-write-api
```

* copie los datos iniciales de coderdojo.

```
~/work/NodeBB $ cp ./node_modules/nodebb-theme-cd-lavender/install/data/* ./install/data
~/work/NodeBB $ ./nodebb setup
~/work/NodeBB $ ./nodebb start
```

* elija el tema usando la página de administración

```
http://localhost:4567/admin
Appearance >> Themes >> <Use Coder Dojo Lavender Theme>
Restart NodeBB (either from admin Dashboard >> Restart or terminal ./nodebb restart)
```

* configure elapi token para sincronizar los perfiles

```
http://localhost:4567/admin/plugins/write-api
Master Tokens >> Create Token
Copy the token and optionally the forum address into your local-env.js like this:
NODEBB_HOST: 'localhost',
NODEBB_PORT: 4567,
NODEBB_TOKEN: 'dc729193-f80c-4c5f-b75c-7a70f16b6e7e'
```

* cargue el logo usando la página de administración

```
http://localhost:4567/admin
Settings >> General>> Site Logo >> Upload Logo
Logo can be uploaded from your local checkout of nodebb-theme-cd-lavender/static/images/logo.png
```

* cargue favicon usando la página de administración

```
http://localhost:4567/admin
Settings >> General>> Site Logo >> Favicon
Icon can be uploaded from your local checkout of nodebb-theme-cd-lavender/static/images/favicon.ico
```

* otros seteos administrativos sugeridos

```
http://localhost:4567/admin
Settings >> General >> Site Tite: forum
Setting >> General >> Browser Title: CoderDojoBB
Settings >> User >> Allow local registration: disabled
Settings >> User >> Allow local login: disabled (make sure sso plugin is working first, or you could lock yourself out!)
```

# Variables de Entorno y Seteos de Configuración

Al implementar NodeBB las siguientes variables de entorno se deben establecer, y también tienen que coincidir en el lado de la Plataforma Comunitaria. Las siguientes variables de entorno son utilizados en el `nodebb-plugin-sso` [library.js] 


* `CODERDOJO_COMMUNITY_PLATFORM` - la URL base de la Plataforma Comunitaria, por defecto `http://localhost:8000` para desarrollo local
* `CODERDOJO_FORUMS_NAME` - el clientId del OAuth2, necesita coincidir con la configurada en la Plataforma Comunitaria
* `CODERDOJO_FORUMS_SECRET` - el clientSecret del OAuth2, de nuevo necesita coincidir con la configurada en la Plataforma Comunitaria

Aquí están las variables son usadas en el módulo nodebb-plugin-sso:
https://github.com/CoderDojo/nodebb-plugin-sso-coderdojo/blob/c5dfa5aad4ea7c1fa76c6c76fb3eacfc01c4b86b/library.js#L15-L24

y aquí en la plataforma comunitaria:
https://github.com/CoderDojo/cp-users-service/blob/d51609b9bedb4d88b4eec8514f0331358c3ecf9a/config/config.js#L79

En el lado de cp-zen-platform, está la opción de configuración del nodo en `options.base`:

https://github.com/CoderDojo/cp-zen-platform/blob/9076bd56d7b0c58312cda0ab0e2c37304c834aa8/web/options.base.js#L53

Esta es la URL externa de los foros de adultos.

## Captura de Pantalla

[![Home View](http://i.imgur.com/1DYWILY.png)](http://i.imgur.com/1DYWILY.png)
