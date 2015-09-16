"use strict";

let processing = require('./processing');

/**
 * Contains information about errors occurring between pairs of sites
 */
class Report {
  
  /**
   * Build a new Report instance
   * @param {string} original - The URL of the original version of the site
   * @param {string} newSite - The URL of the new version of the site
   */
  constructor(original, newSite) {
    this.original = original;
    this.new = newSite;
    this.originalErrors = [];
    this.newErrors = [];
  }

  /**
   * Record an occurrence of a new error on the old version of the site
   * @param {error} err - Information about the error
   */
  errorOnOriginalSite(err) {
    this.originalErrors.push(err);
  }

  /**
   * Record an occurrence of a new error on the new version of the site
   * @param {error} err - Information about the error
   */
  errorOnNewSite(err) {
    this.newErrors.push(err);
  }

  /**
   * Computes the set difference between the errors that occurred on the
   * original (old) version of the site and the new version of the site.
   * @return an array of errors unique to the new site
   */
  uniqueErrors() {
    return;
  }
}


/**
 * Test how close two sites are in behavior and report differences in errors.
 * @param {string} original - The URL of the original version of the site
 * @param {string} newVer - The URL of the new version of the site
 * @return a promise that resolves to a Report containing information about errors
 */
function testSite(original, newVer) {
  return new Promise((resolve, reject) => {
    let report = new Report(original, newVer);
    // TODO - Replace me with calls to real testing code
    report.errorOnOriginalSite(new Error('Test error message 1'));
    report.errorOnOriginalSite(new Error('Bazinga'));
    report.errorOnNewSite(new Error('Bazurple'));
    report.errorOnNewSite(new Error('Bazinga'));
    // ----------------------- END  TODO
    resolve(report);
  });
}

/**
 * Produce a nicely-formatted, human-readable report about the errors that
 * occurred when running the site with PhantomJS,
 * @param {array} reports - Instances of Report to write about
 */
function produceReport(reports) {
  // TODO - Create something that actually looks nice
  let report = '';
  for (let i = 0, len = reports.length; i < len; i++) {
    report += '\n\nErrors that occurred between ' + reports[i].original;
    report += ' and ' + reports[i].new;
    for (let j = 0, len2 = reports[i].originalErrors.length; j < len2; j++) {
      report += '\n' + reports[i].originalErrors[j].message;
    }
    for (let j = 0, len2 = reports[i].newErrors.length; j < len2; j++) {
      report += '\n' + reports[i].newErrors[j].message;
    }
    report += '\n';
  }
  return new Promise((resolve, reject) => resolve(report));
}


function main() {
  if (process.argv.length !== 3) {
    console.log('Run with npm start <yaml-file-name>');
    return;
  }
  processing.promiseToRead(process.argv[2])
  .then(content => {
    return processing.parseSiteList(content.toString());
  })
  .then(yaml => {
    let reportPromises = yaml.map(pair => testSite(pair.original, pair.new));
    return Promise.all(reportPromises);
  })
  .then(reports => {
    return produceReport(reports);
  })
  .then(reportMsg => console.log(reportMsg))
  .catch(e => {
    console.log('[ERROR]');
    console.log('\tMessage:', e.message);
    console.log('\tLine:', e.lineNumber);
    console.log('\tFile:', e.fileName, '\n');
  });
}

main();

// Export functions here for the sake of unit testing
// Enhanced object literal syntax in action!
module.exports = {
  Report,
  testSite,
  produceReport
};
