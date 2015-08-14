# Localisation

All the language translation files are stored in the ````web\locale```` folder in the appropriate language folder named according to the language's code eg. en_US for English in the United States.

## Adding a new Language

1. Create a folder with the appropriate language code
2. Create a messages.po file
3. Use the messages.po file in ````web\locale\en_US```` as a guide, the ````msgid```` will be the same only ````msgstr```` should be different per translation.  
    *Example:*

    `web\locale\en_US\messages.po`:  
        msgid "Yes"  
        msgstr "Yes"  
    `web\locale\de_DE\mesages.po`:  
        msgid "Yes"  
        msgstr "Ja"

4. Add the new language to the [config/languages.js](https://github.com/CoderDojo/cp-zen-platform/blob/780e98584f1134a1e9166758b6fb5ff99c654647/web/config/languages.js) file.
  

## Switching Languages

The platform makes use of the ````Accept-Language```` header to determine which messages.po file to use. This can be changed by modifying the language settings in the browser. The language initial language setting can be overriden by selecting the desired language from the drop down in the navigation bar and it will be saved for subsequent visits.

## Crowdin

We use [CrowdIn](https://crowdin.com/) to help manage localizations.

Three services currently have localisable material: cp-zen-platform, cp-dojos-service & cp-users-service. When these services are being built, jenkins syncs with CrowdIn via the crowdin command line tool:

    crowdin-cli upload sources # uploads any changes to Crowdin (if there are any)
    crowdin-cli download -l it # download any changes for Italian from Crowdin (if there are any)

The translations are then included in the build and get deployed as part of the build artifact (no translations are kept in github).
