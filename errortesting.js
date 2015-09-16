"use strict";

/**
 * A set of helper functions to interact with the phantom library using promises
 * instead of the standard callback-based approach.
 */

function phCreate() {
  return new Promise((resolve, reject) =>
    phantom.create(phantomInst => resolve(phantomInst)));
}

function phCreatePage(phantomInstance) {
  return new Promise((resolve, reject) =>
    phantomInstance.createPage(page => resolve(page)));
}

function phPageOpen(page, url) {
  return new Promise((resolve, reject) =>
    // TODO - May want to also pass page through the resolver
    page.open(url, stat => resolve(stat)));
}

function phPageOnError(page, errHandler) {
  return new Promise((resolve, reject) =>
    page.onError(err => {
      errHandler(err);
      resolve(page);
    }));
}

module.exports = {
  phCreate,
  phCreatePage,
  phPageOpen,
  phPageOnError
};
