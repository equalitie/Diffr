let fs = require('fs');
let yaml = require('js-yaml');

/**
 * Return a promise that will resolve with the file's contents.
 * @param {string} filename - The path to the file to read
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
 @ return an object with a wellFormatted <bool> field and optional error <Error> field
 */
function testYAMLFormatting(parsed) {
  // Format of parsed object is {sites: [{first: site, second: site}]}
  if (!("sites" in parsed)) {
    return {
      wellFormatted: false,
      error: new Error('Parsed YAML has no "sites" property"')
    };
  } else if (Object.prototype.toString.call(parsed.sites) !== '[object Array]') {
    return {
      wellFormatted: false,
      error: new Error('"sites" property in parsed YAML is not an array')
    };
  }
  for (let i = 0, len = parsed.sites.length; i++) {
    if (!('first' in parsed.sites[i]) || !('second' in parsed.sites[i])) {
      return {
        wellFormatted: false,
        error: new Error('Found element that does not contain a "first" or "second" property')
      };
    }
  }
  return {wellFormatted: true};
}

/**
 * Parse a string containing YAML listing the sites to test
 * into a usable array.
 * @param {string} raw - The string containing YAML
 * @return a promise that resolves to an array of {first: <url>, second: <url>} objects
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

console.log('Hello world!');
phantom.exit();
