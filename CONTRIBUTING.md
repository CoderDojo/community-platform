# Contributing to Community Platform (Zen)

## Issue Contributions

When opening new issues or commenting on existing issues on this repository
please make sure discussions are related to concrete technical issues with the
Zen software.

Discussion of non-technical topics including subjects like intellectual
property, trademark and high level project questions ideally should move to the
[Forums](https://forums.coderdojo.com) instead.

## Code Contributions

The Zen project welcomes new contributors.
Individuals making significant and valuable contributions are made
_Collaborators_ and given commit-access to the project. 

This document will guide you through the contribution process.

### Step 1: Fork

Fork the project [on GitHub](https://github.com/CoderDojo/cp-local-development) and check out your
copy locally. 


#### Which branch?

For developing new features and bug fixes, the `master` branch needs to be pulled
and built upon. Zen follows a [Continuous Integration](https://en.wikipedia.org/wiki/Continuous_integration)
model, where the master branch is always deployed to production. 

Please follow [instructions on the development repository](https://github.com/CoderDojo/cp-local-development) to get your development environment set up.


### Step 2: Branch

Create a feature branch and start hacking:

```text
$ git checkout -b my-feature-branch -t origin/master
```

### Step 3: Commit

Make sure git knows your name and email address:

```text
$ git config --global user.name "J. Random User"
$ git config --global user.email "j.random.user@example.com"
```

Writing good commit logs is important.  A commit log needs to describe what
changed and why.  Follow these guidelines when writing one:

1. The first line ideally should be 50 characters or less and contain a short
description of the change 
2. Keep the second line blank.
3. Wrap all other lines at 72 columns.

A good commit log can look something like this:

```
explaining the commit in one line

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc. etc.

The body of the commit message can be several paragraphs, and
please do proper word-wrap and keep columns shorter than about
72 characters or so. That way `git log` will show things
nicely even when it is indented.
```

The header line needs to be meaningful; it is what other people see when they
run `git shortlog` or `git log --oneline`.


### Step 4: Rebase

Use `git rebase` (not `git merge`) to sync your work from time to time.

```text
$ git fetch upstream
$ git rebase upstream/master
```


### Step 5: Test

Bug fixes and features **need to come with tests**.  Add your tests in the
test directory of each effected microservice. Look at other tests to see how they are structured.

```text
$ npm test
```

Make sure the linter is happy and that all tests pass.  Please, do not submit
patches that fail either check.

You can run individual tests directly with Lab:

```text
$ ./node_modules/.bin/lab test/lib/test-user-data.js
```

### Step 6: Push

```text
$ git push origin my-feature-branch
```

Go to https://github.com/yourusername/<zen-repo> and select your feature branch.
Click the 'Pull Request' button and fill out the form.

Pull requests are usually reviewed within a few days.  If there are comments
to address, apply your changes in a separate commit and push that to your
feature branch.  Post a comment in the pull request afterwards; GitHub does
not send out notifications when you add commits.

## Translations

Any displayed strings added in your commits should be ready to be translated. There's a few things you'll need to know about.

### cp-translations

Some of our translations are used in multiple microservices. As a result, we have taken steps to centralise our strings into cp-translations.
In this repo, you'll find two sets of files, PO (Gettext) files, and email templates (EJS). If you introduce new strings, you should update the PO file, if it's a new email template, add it to the email-templates folder.

In order to test with cp-translations, it's easiest to use `npm link`. Simply `cd` into `cp-translations` and run `npm link`. Then, `cd` into each relevant micro-service, and run `npm link cp-translations`. This will symlink the repos so you can use your local copy of cp-translations with your code.

### Translating in the code

#### Dust.js

If you're just using some text directly in a dust template, simply wrap your string with `{@i18n key="My string"/}`. So for example, if you have `<h1>My Dojos</h1>`, you should update the template to read `<h1>{@i18n key="My Dojos"/}</h1>`.

#### Angular.js

Sometimes we need some data about what we're showing before we can translate. In this scenario, we use [angular-translate](https://github.com/angular-translate/angular-translate). You will already have access to the new strings added in messages.po, so you can simply follow the [API documentation](https://angular-translate.github.io/docs/#/api) available.

#### Email templates

Emails are sent using [seneca-mail](https://github.com/rjrodger/seneca-mail). You should be able to follow the documentation provided.

### Help

As always, we're here to help. If you're unsure about anything, ping us on [Gitter](https://gitter.im/CoderDojo/community-platform) and we'll guide in the right direction

## Developer's Certificate of Origin 1.0

By making a contribution to this project, I certify that:

* (a) The contribution was created in whole or in part by me and I
have the right to submit it under the open source license indicated
in the file; or
* (b) The contribution is based upon previous work that, to the best
of my knowledge, is covered under an appropriate open source license
and I have the right under that license to submit that work with
modifications, whether created in whole or in part by me, under the
same open source license (unless I am permitted to submit under a
different license), as indicated in the file; or
* (c) The contribution was provided directly to me by some other
person who certified (a), (b) or (c) and I have not modified it.


## Code of Conduct

This Code of Conduct is adapted from [Rust's wonderful
CoC](http://www.rust-lang.org/conduct.html).

* We are committed to providing a friendly, safe and welcoming
environment for all, regardless of gender, sexual orientation,
disability, ethnicity, religion, or similar personal characteristic.
* Please avoid using overtly sexual nicknames or other nicknames that
might detract from a friendly, safe and welcoming environment for
all.
* Please be kind and courteous. There's no need to be mean or rude.
* Respect that people have differences of opinion and that every
design or implementation choice carries a trade-off and numerous
costs. There is seldom a right answer.
* Please keep unstructured critique to a minimum. If you have solid
ideas you want to experiment with, make a fork and see how it works.
* We will exclude you from interaction if you insult, demean or harass
anyone.  That is not welcome behavior. We interpret the term
"harassment" as including the definition in the [Citizen Code of
Conduct](http://citizencodeofconduct.org/); if you have any lack of
clarity about what might be included in that concept, please read
their definition. In particular, we don't tolerate behavior that
excludes people in socially marginalized groups.
* Private harassment is also unacceptable. No matter who you are, if
you feel you have been or are being harassed or made uncomfortable
by a community member, please contact one of the channel ops or any
of the TC members immediately with a capture (log, photo, email) of
the harassment if possible.  Whether you're a regular contributor or
a newcomer, we care about making this community a safe place for you
and we've got your back.
* Likewise any spamming, trolling, flaming, baiting or other
attention-stealing behavior is not welcome.
* Avoid the use of personal pronouns in code comments or
documentation. There is no need to address persons when explaining
  code (e.g. "When the developer")
