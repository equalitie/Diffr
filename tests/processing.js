"use strict";

let should = require('should');
let yaml = require('js-yaml');
let proc = require('../processing');

console.log(proc);

// Keys expected to exist in successfully parsed YAML
const originalK = 'original';
const newK = 'new';

// Multi-line string containing YAML that should pass our formatting test
const wellFormattedYaml = `
---
sites:
  - original: http://google.ca
    new: https://encrypted.google.com

  - original: http://reddit.com
    new: https://reddit.com
`;

// Multi-line string containing YAML that should fail our formatting test
const notWellFormattedYaml = `
---
sites:
  pair1:
    original: http://google.ca
    new: https://encrypted.google.com

  pair2:
    original: http://reddit.com
    new: https://reddit.com
`;

// Multi-line string containing YAML that should throw errors during parsing
const invalidYaml = `
---
sites:
  - original: http://google.com
  - new: https://encrypted.google.com

  original: http://reddit.com
  new: https://reddit.com
`;

describe('module processing', () => {
  
  describe('promiseToRead', () => {

    it('should resolve with the contents of a file if it can be read', done => {
      proc.promiseToRead('./processing.js')
      .then(content => {
        should.exist(content);
        content.length.should.be.greaterThan(0);
        done();
      })
      .catch(e => {
        console.log('In catch');
        console.log(e.message);
        ('this').should.be.exactly('fail');
        done();
      });
    });

    it('should reject when the file cannot be read', done => {
      proc.promiseToRead('/garbage/we/should/not/read.blah')
      .then(content => {
        'this'.should.be.exactly('fail');
        done();
      })
      .catch(e => {
        should.exist(e);
        done();
      });
    });
  });

  describe('testYamlFormatting', () => {

    it('should report that YAML of the expected format is well-formatted', () => {
      let parsed = yaml.safeLoad(wellFormattedYaml);
      let result = proc.testYamlFormatting(parsed);
      should.exist(result);
      result.should.have.property('wellFormatted');
      result.should.not.have.property('error');
      result.wellFormatted.should.be.true;
    });

    it('should report that YAML not of the expected format is not well-formatted', () => {
      let parsed = yaml.safeLoad(notWellFormattedYaml);
      let result = proc.testYamlFormatting(parsed);
      should.exist(result);
      result.should.have.property('wellFormatted');
      result.wellFormatted.should.be.false;
      result.should.have.property('error');
    });
  });

  describe('parseSiteList', () => {
  
    it('should resolve with an array of site pairs when provided valid YAML', done => {
      proc.parseSiteList(wellFormattedYaml)
      .then(sites => {
        Object.prototype.toString.call(sites).should.be.exactly('[object Array]');
        sites.length.should.be.exactly(2);
        for (let i = 0, len = sites.length; i < len; i++) {
          sites[i].should.have.property(originalK);
          sites[i].should.have.property(newK);
        }
        done();
      })
      .catch(e => {
        'this'.should.be.exactly('fail');
        done();
      });
    });

    it('should reject when provided invalid YAML', done => {
      proc.parseSiteList(invalidYaml)
      .then(sites => {
        'this'.should.be.exactly('fail');
      })
      .catch(e => {
        should.exist(e);
        done();
      });
    });
  });
});
