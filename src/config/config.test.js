process.env.NODE_ENV = 'test';

const request = require('supertest');
const config = require('./config')
const Command = require('../models/Command')
const yaml = require('js-yaml');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect

describe('Config findCommand', () => {
    it('should find git status short command', (done) => {
        let args = ['git', 'status', 'short']
        config.findCommand(args).then(comData => {
            expect(comData).not.to.be.null
            let command = Object.assign(new Command(), comData);
            expect(command.cmd).to.be.equal('git status -s')
            expect(command.description).to.be.equal('Run git status -s command')
            done()
        }).catch(error => {
            done(error)
        })
    });
    it('should return error (missing command)', (done) => {
        let args = ['echo', 'arg2']
        config.findCommand(args).then(comData => {
            done("Should return an error")
        }).catch(error => {
            expect(error).to.be.equal("Key not found")
            done()
        })
    });
    it('should return error (missing cmd or desc)', (done) => {
        let args = ['ls']
        config.findCommand(args).then(comData => {
            done("Should return an error")
        }).catch(error => {
            expect(error).to.be.equal("Command not found")
            done()
        })
    });
});
describe('Config helpText', () => {
    it('should get helptext', (done) => {
        config.getHelpText().then(helpText => {
            let split = helpText.split('\n')
            expect(split[0]).to.be.equal('')
            expect(split[1]).to.be.equal('usage: ali [Command|Alias] -a [args]')
            expect(split[2]).to.be.equal('')
            expect(split.length).to.be.greaterThan(3)
            done()
        }).catch(error => {
            done(error)
        })
    });
});