#!/bin/bash

if [ "$TRAVIS_REPO_SLUG" == "GeoscienceAustralia/geo-web-toolkit" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  
  echo -e "Publishing ng-docs...\n"
  
  cp -R docs $HOME/docs-latest

  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/GeoscienceAustralia/geo-web-toolkit gh-pages > /dev/null

  cd gh-pages
  git rm -rf ./docs
  cp -Rf $HOME/docs-latest ./docs
  git add -f .
  git commit -m "Lastest ng-docs on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "Published ng-docs to gh-pages.\n"
  
fi