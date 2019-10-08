const cmd = require('./tools/cmd')
const chai = require('chai');
const expect = chai.expect


describe('Ali echo command', () => {
    it('should run echo command', (done) => {
        cmd.run('./src/ali.js e -a "hello Ali"', function (err, data) {
            expect(data).not.to.be.null
            let split = data.split('\n')
            expect(split[0]).to.equal('Running: echo "hello Ali"')
            expect(split[1]).to.equal('hello Ali')
            done()
        })
    });
});

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
