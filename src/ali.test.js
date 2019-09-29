process.env.NODE_ENV = 'test';

const request = require('supertest');
const cmd = require('./tools/cmd')
const yaml = require('js-yaml');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect

describe('Ali help', () => {
    it('should return help text', (done) => {
        cmd.run('./src/ali.js', function (err, data) {
            expect(data).not.to.be.null
            expect(data).length.greaterThan(0)
            done();
        })
    });
    it('should return help text (--help)', (done) => {
        cmd.run('./src/ali.js --help', function (err, data) {
            expect(data).not.to.be.null
            expect(data).length.greaterThan(0)
            done();
        })
    });
});

describe('Ali version', () => {
    it('should return version', (done) => {
        cmd.run('./src/ali.js --version', function (err, data) {
            expect(data).to.be.equal(require("../package.json").version)
            done()
        })
    });
});
