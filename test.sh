#!/bin/bash
if [ -f ./tests/package.json.old ]; then
  rm ./tests/package.json
  cp ./tests/package.json.old ./tests/package.json
else
  cp ./tests/package.json ./tests/package.json.old
fi


TRAVIS=true TRAVIS_PULL_REQUEST=false TRAVIS_TAG=1.2.3 ./index.js ./tests/nofile.json > /dev/null
if [ $? -ne 1 ]; then
  echo "Expected exit status '1' from specifying non-existing file"
  exit 1
fi


TRAVIS=true TRAVIS_PULL_REQUEST=false TRAVIS_TAG=1.2.3 ./index.js ./tests/ --field foo --field thud > /dev/null
if [ $? -ne 0 ]; then
  exit 1
fi

TRAVIS_TAG=1.2.3 $(yarn bin)/mocha tests/*.js
exit $?
