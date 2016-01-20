# Zen, the CoderDojo Community Platform

[![Join the chat at https://gitter.im/CoderDojo/community-platform](https://badges.gitter.im/CoderDojo/community-platform.svg)](https://gitter.im/CoderDojo/community-platform?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Welcome to "Zen"! You can see the live site at [zen.coderdojo.com](https://zen.coderdojo.com).

This repository is the documentation for the project. [We log issues in this repository](https://github.com/CoderDojo/community-platform/issues).

There are also [three microservice respositories and a frontend repository](https://github.com/CoderDojo/community-platform/blob/master/architecture.md).

If you want to jump straight in to getting your development environment set up, [visit the development environment repository here](https://github.com/CoderDojo/cp-local-development).

# About the project

[CoderDojo](coderdojo.com) is a network of free computer programming clubs for youths aged 7-17. It is a global charity and we currently have over 860 clubs in over 60 countries!

Zen was originally set up to track new "Dojos" (coding clubs) and help the [CoderDojo Foundation](https://coderdojo.com/about/coderdojo-foundation/) track new clubs being set up worldwide.
In 2015, it was redeveloped to be a fully fledged community platform. It is built entirely in javascript using [NodeJS](https://nodejs.org/) and [AngularJS](https://angularjs.org/).

It includes:
- Ability to search for a Dojo (coding club) and join the club
- A bespoke ticketing system where parents and mentors can book tickets for their local club
- Profile pages for parents, mentors and youths
- Two forums (Over 13 and community forum), running on [NodeBB](https://nodebb.org/).
- [Mozilla Open Badges](http://openbadges.org/) integration.

Most of the technology we use is open source, and we are proud of it! For CoderDojo related questions, contact info@coderdojo.org.
Get in touch with ursula@coderdojo.org with any technical questions.

## Contributing to Zen

There are various ways to contribute to Zen:

* as a developer, instructions for creating a local development environment can be found in the [cp-local-development](https://github.com/CoderDojo/cp-local-development) repository. You may also wish to read the [contributing](CONTRIBUTING.md) guide.
* as a translator, we use [CrowdIn](https://crowdin.com/project/zen-community-platform) to help manage localisation, please sign up and help out!
* issue management, we keep track of all our issues in GitHub in this repo, [help out here](https://github.com/CoderDojo/community-platform/issues)
* documentation, by contributing to the documentation in this repository.

## Where to begin

View our [Speaker Deck](https://speakerdeck.com/helloworldfoundation/contributing-to-zen-the-coderdojo-open-source-community-platform)!

There are a few labels in particular that are very useful if you are new to Zen:
* The [beginner](https://github.com/CoderDojo/community-platform/labels/beginner) label marks anything considered easy enough for a first time contributor. 
* The [request for comments](https://github.com/CoderDojo/community-platform/labels/request%20for%20comments) label is great for non-coders or people wishing to get familiar with the system. These are often features we are not sure if we want to produce yet, or issues that require clearer implementation guidelines.
* The [hints provided](https://github.com/CoderDojo/community-platform/labels/hints%20provided) label is attached to anything which has been given a technical spec by someone on the development team.

### Bug fixes

* Ideally all of the [bugs](https://github.com/CoderDojo/community-platform/labels/bug) are the most important issues to fix. They are categorised by priority. 
* There is a [critical bugs milestone](https://github.com/CoderDojo/community-platform/milestones/Critical%20bugs) for the most important bugs.
* Some bugs are smaller CSS issues that are marked low priority and so are not as important to work on. 

### Priorities for the project

Once you're familiar with the codebase, there are a number of labels/milestones to guide you through our roadmap.
- Our [top priority](https://github.com/CoderDojo/community-platform/labels/top%20priority) label is for features which are the most important
- For immediate issues, there is a section for [Q1 2016](https://github.com/CoderDojo/community-platform/milestones/2016%20Q1)
- Issues are sorted by other priority levels, [low](https://github.com/CoderDojo/community-platform/labels/low%20priority), [normal](https://github.com/CoderDojo/community-platform/labels/normal%20priority) and [high](https://github.com/CoderDojo/community-platform/labels/high%20priority)
- We also have a [short term roadmap](https://github.com/CoderDojo/community-platform/milestones/Short%20term%20roadmap) and [long term roadmap](https://github.com/CoderDojo/community-platform/milestones/Long%20term%20roadmap)

Still not sure? Get in touch, let us know what you are interested in working on and we're happy to provide guidance.

#### Working on an issue?

- Comment on it and let us know so we don't duplicate any effort.
- We can add you to the official CoderDojo development team so you can assign yourself issues. 
- Tag [@tangentfairy](https://github.com/tangentfairy) if you have any questions.

## Developer Support

* The CoderDojo Foundation Technical Lead is available to help you get set up.
* We have [a gitter channel here](https://gitter.im/CoderDojo?utm_source=share-link&utm_medium=link&utm_campaign=share-link) if you have any questions.
* Those who have commited to the project can be added to the Foundation Slack community for daily communications. Please get in touch to be added! 
* To get in touch, email us at info@coderdojo.org
* To deploy a change, you'll need to get in touch as only those with commit access can do so. 
* Have a read through [closed pull requests](https://github.com/CoderDojo/cp-zen-platform/pulls?q=is%3Apr+is%3Aclosed) in the frontend repository to get a feel for what we have been working on.

## License

The Community Platform (Zen) is copyright The CoderDojo Foundation, and open sourced under the [MIT license](LICENSE.md).

## Documentation

The following is a list of further reading:

* [Architecture](architecture.md) - a high level overview of the system, the code layout, etc
* [Localisation](localisation.md) - some notes on localisation
* [Forums](forums.md) - some developer notes on the forums
