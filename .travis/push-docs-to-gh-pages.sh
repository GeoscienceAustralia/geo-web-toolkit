#!/bin/bash

if [ "$TRAVIS_REPO_SLUG" == "GeoscienceAustralia/geo-web-toolkit" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  
  echo -e "Publishing ng-docs...\n"
  
  cp -R docs $HOME/docs-latest
  cp -R docs-sources $HOME/docs-sources-latest
  cp -R target/classes/META-INF/resources/webjars/geo-web-toolkit $HOME/dist-latest
  cp -R target/dist $HOME/dist-latest/latest
  
  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/GeoscienceAustralia/geo-web-toolkit gh-pages > /dev/null

  cd gh-pages
  git rm -rf ./docs > /dev/null
  git rm -rf ./docs-sources > /dev/null
  git rm -rf ./dist/latest > /dev/null
  cp -Rf $HOME/docs-latest ./docs
  cp -Rf $HOME/docs-sources-latest ./docs-sources
  cp -Rf $HOME/dist-latest ./dist
  git add -f .
  git commit -m "Lastest ng-docs on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "Published ng-docs to gh-pages.\n"
  
fi
