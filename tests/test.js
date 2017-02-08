const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json')).toString());
const oldPackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json.old')).toString());

const expect = require('chai').expect;

it('changes the package.json', () => {
  expect(packageJson).to.not.deep.equal(oldPackageJson);
});

it('preserves most fields unaltered', () => {
  [
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
    'foo',
  ].forEach((field) => {
    expect(packageJson).to.contain.key(field)
    expect(packageJson[field]).to.deep.equal(oldPackageJson[field]);
  });
});

it('does not include keys that it is told to include but do not exist', () => {
  expect(packageJson).not.to.have.all.keys([
    'thud'
  ]);
})

it('omits some fields (mostly ones that it does not know, and are not specified)', () => {
  expect(packageJson).not.to.have.all.keys([
    'devDependencies',
    'baz'
  ]);
})

it('sets the version to equal the current tag (for use in travis)', () => {
  expect(packageJson.version).to.equal(process.env.TRAVIS_TAG);
})

it('sets the package to be non-private', () => {
  expect(packageJson.private).to.equal(false);
})
