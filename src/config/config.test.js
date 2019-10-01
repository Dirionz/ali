process.env.NODE_ENV = 'test';

const request = require('supertest');
const config = require('./config')
const Command = require('../models/Command')
const yaml = require('js-yaml');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect

describe('Config', () => {
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
        let args = ['echo', 'message']
        config.findCommand(args).then(comData => {
            done("Should return an error")
        }).catch(error => {
            expect(error).to.be.equal("Key not found")
            done()
        })
    });
});