"use strict";

let phantom = require('../errortesting');


describe('phantom wrappers', () => {

  describe('phCreate', () => {

    it('should resolve to a genuine phantom instance', done => {
      phantom.phCreate()
      .then(phantomInstance => {
        should.exist(phantomInstance);
        phantomInstance.should.have.property('createPage');
        done();
      })
      .catch(e => {
        ('this').should.be.exactly('fail');
        done();
      });
    });
  });

  describe('phCreatePage', () => {

    it('should resolve to a genuine page instance', done => {
      phantom.phCreate()
      .then(phantomInstance => phantom.phCreatePage(phantomInstance))
      .then(page => {
        should.exist(page);
        page.should.have.property('open');
        done();
      })
      .catch(e => {
        ('this').should.be.exactly('fail');
        done();
      });
    });
  });

  describe('phPageOpen', () => {

    it('should open a page and provide us with stats about it', done => {
      phantom.phCreate()
      .then(ph => phantom.phCreatePage(ph))
      .then(page => phantom.phPageOpen(page, 'https://encrypted.google.com'))
      .then(stats => {
        should.exist(stats);
        done();
      })
      .catch(e => {
        ('this').should.be.exactly('fail');
        done();
      });
    });
  });

  describe('phPageOnError', () => {

    it('should call an error handler if something goes wrong with the page', done => {
      phantom.phCreate()
      .then(ph => phantom.phCreatePage(ph))
      .then(page => phantom.phPageOnError(page, err => {
        should.exist(err);
        done();
      }))
      .then(page => phantom.phPageOpen(page, 'duhfiuadfgh'))
      .then(stat => null)
      .catch(e => {
        ('this').should.be.exactly('fail');
        done();
      });
    });
  });
});
