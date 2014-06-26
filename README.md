# Geo Web Toolkit [![Build Status](https://travis-ci.org/GeoscienceAustralia/geo-web-toolkit.svg?branch=doco-comments)](https://travis-ci.org/GeoscienceAustralia/geo-web-toolkit)

Geoscience Australia's web mapping toolkit.

Contains AngularJS-based modules to support rapid development of web mapping applications.

## Requirements

Required:

* Java 1.6+
* Maven 3+

Recommended:

* NodeJS^

^a local copy is installed as part of the Maven build, but a global install will make it easier to quickly run the JS unit tests locally.

## Building

The toolkit can be built using Maven

`>> mvn clean install`

## Documentation

Maven build generates ngdocs in the `docs` directory.

Generated docs are available [here](http://geoscienceaustralia.github.io/geo-web-toolkit/docs/).

## Running tests locally

The toolkit uses Webjars to manage web resource dependencies. To run the Karma tests in interactive mode (useful during development), you will first need to run the project in a Servlet 3.0 compliant container so that the webjar resources are available. The easiest way to do this is to use the configured Jetty runner.

`>> mvn jetty:run`

Then the Karma runner can be launched using the following (assuming you have installed Karma globally as described at http://karma-runner.github.io/0.12/intro/installation.html)

`>> karma start src/test/js/config/karma.conf.js`

Alternatively, if you are using a JS-aware IDE (such as Webstorm etc.) you can now execute the JS tests from within the IDE.
