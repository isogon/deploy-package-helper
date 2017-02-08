#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_KEPT_KEYS = [
  'name',
  'description',
  'keywords',
  'homepage',
  'bugs',
  'main',
  'bin',
  'scripts',
  'repository',
  'license',
  'author',
  'contributors',
  'engines',
  'dependencies',
  'peerDependencies',
];


// Ensure we are only running in travis-ci under the right conditions
// Otherwise we are prepping a packge that should not be deployed
if (process.env.TRAVIS !== 'true') {
  console.log('you should not be deploying outside of travis')
  process.exit(1);
}

if (process.env.TRAVIS_PULL_REQUEST !== 'false') {
  console.log('deploys should never be run for pull requests');
  process.exit(1);
}

const tagName = process.env.TRAVIS_TAG;

if (tagName.replace(/^\d+\.\d+\.\d+$/, '') !== '') {
  console.log(`the tag '${tagName}' is not a valid semver version`);
  process.exit(1);
}


const argv = require('minimist')(process.argv.slice(2));


// Figure out what file we will be operating on
if (argv._.length >= 2) {
  console.log('You may only specify one file to operate on.');
  process.exit(1);
}

if (argv._.length !== 1) {
  console.log('You must only a file to operate on.');
  process.exit(1);
}

const potentialFiles = [
  path.resolve(process.cwd(), argv._[0]),
  path.resolve(process.cwd(), argv._[0], 'package.json'),
];

let finalFilePath;
if (!potentialFiles.some((fullpath) => {
  try {
    const stat = fs.statSync(fullpath);

    if (stat.isFile()) {
      finalFilePath = fullpath;
      return true;
    }
  } catch (e) {}

  return false;
})) {
  console.log('Unable to find package.json, tried:');
  potentialFiles.forEach((file) => console.log(`  ${file}`));
  process.exit(1)
}


// Allow additional keys to include to be passed in as --field (and handle 0, 1, many cases)
let additionalKeptKeys = [];
if (Array.isArray(argv.field)) {
  additionalKeptKeys = argv.field;
} else if (!!argv.field) {
  additionalKeptKeys.push(argv.field);
}

// Load the package.json
const currentPackage = JSON.parse(fs.readFileSync(finalFilePath).toString());


// Calculate the new package.json
const newPackage = [...DEFAULT_KEPT_KEYS, ...additionalKeptKeys].reduce((acc, key) => {
  if (!Object.hasOwnProperty.call(currentPackage, key)) {
    return acc;
  }

  return Object.assign(acc, {
    [key]: currentPackage[key],
  });
}, { version: tagName, private: false });


// Write the new package.json out
fs.writeFileSync(finalFilePath, JSON.stringify(newPackage, null, 2));
