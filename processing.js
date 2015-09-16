"use strict";

let fs = require('fs');
let yaml = require('js-yaml');

/**
 * Names of the keys expected to exist in the YAML we're to parse.
 * The expected format is as follows:
 * ---
 * sites:
 *   - original: <url>
 *     new: <url>
 *
 *   - original: <url>
 *     new: <url>
 */
const sitesK = 'sites';
const originalK = 'original';
const newK = 'new';

/**
 * Read a file on the disk.
 * @param {string} filename - The path to the file to read
 * @return a promise resolving to the content of the file as a Buffer
 */
function promiseToRead(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

/**
 * Determine whether a parsed YAML file is of the format we expect
 * @param {object} parsed - The parse YAML content
 * @return an object with a wellFormatted <bool> field and optional error <Error> field
 */
function testYamlFormatting(parsed) {
  // Check that the inner array of pairs of sites is headed by a 'sites' key
  if (!(sitesK in parsed)) {
    return {
      wellFormatted: false,
      error: new Error('Parsed YAML has no ' + sitesK + ' property')
    };
  } else if (Object.prototype.toString.call(parsed.sites) !== '[object Array]') {
    return {
      wellFormatted: false,
      error: new Error(sitesK + ' property in parsed YAML is not an array')
    };
  }
  // Ensure that each element of the array under 'sites' is an object
  // with an 'original' key and a 'new' key
  for (let i = 0, len = parsed.sites.length; i < len; i++) {
    let site = parsed.sites[i];
    if (!(originalK in site)) {
      return {
        wellFormatted: false,
        error: new Error('Pair ' + pairName + ' has no ' + originalK + ' key')
      };
    } else if (!(newK in site)) {
      return {
        wellFormatted: false,
        error: new Error('Pair ' + pairName + ' has no ' + newK + ' key')
      };
    }
  }
  return {wellFormatted: true};
}

/**
 * Parse a string containing YAML listing the sites to test
 * into a usable array.
 * @param {string} raw - The string containing YAML
 * @return a promise that resolves to an array of {original: <url>, new: <url>} objects
 */
function parseSiteList(raw) {
  return new Promise((resolve, reject) => {
    let rejectCalled = false;
    let parsed = yaml.safeLoad(raw, {
      // Call reject if there are any warnings when parsing
      onWarning: warning => {
        rejectCalled = true;
        reject(warning);
      },
      // Only support strings, arrays, and plain objects
      schema: yaml.FAILSAFE_SCHEMA
    });
    if (!rejectCalled) {
      let results = testYamlFormatting(parsed);
      if (!results.wellFormatted) {
        reject(results.error);
      } else {
        resolve(parsed.sites);
      }
    }
  });
}

// Enhanced object literal syntax in action!
module.exports = {
  promiseToRead,
  parseSiteList,
  testYamlFormatting
};
