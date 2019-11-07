process.env.NODE_ENV = 'test';

const config = require('./config')
const Command = require('../models/Command')
const fs = require('fs')
const path = require('path');
const sinon = require('sinon')
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
describe('Config splitArgs', () => {
    it('should split args using -a', (done) => {
        let arg1 = ['something', 'something', '-a', 'arg1', 'arg2']
        config.splitArgs(arg1).then(args => {
            expect(args).to.be.an('array').that.is.not.empty;
            expect(args[0]).to.be.an('array')
            expect(args[0]).to.include('something')
            expect(args[0]).to.not.include('-a')
            expect(args[1]).to.be.an('array')
            expect(args[1]).to.not.include('-a')
            expect(args[1]).to.include('arg1')
            expect(args[1]).to.include('arg2')
            done()
        }).catch(error => {
            done(error)
        })
    });
    it('should split args using --args', (done) => {
        let arg1 = ['something', 'something', '--args', 'arg1', 'arg2']
        config.splitArgs(arg1).then(args => {
            expect(args).to.be.an('array').that.is.not.empty;
            expect(args[0]).to.be.an('array')
            expect(args[0]).to.include('something')
            expect(args[0]).to.not.include('-a')
            expect(args[1]).to.be.an('array')
            expect(args[1]).to.not.include('-a')
            expect(args[1]).to.include('arg1')
            expect(args[1]).to.include('arg2')
            done()
        }).catch(error => {
            done(error)
        })
    });
    it('should return empty args', (done) => {
        let arg1 = ['something', 'something']
        config.splitArgs(arg1).then(args => {
            expect(args).to.be.an('array').that.is.not.empty;
            expect(args[0]).to.be.an('array')
            expect(args[0]).to.include('something')
            expect(args[0]).to.not.include('-a')
            done()
        }).catch(error => {
            done(error)
        })
    });
    it('should return no args given error', (done) => {
        let arg1 = ['something', 'something', '-a']
        config.splitArgs(arg1).then(args => {
            done("No error given")
        }).catch(error => {
            expect(error).to.be.equal('No arguments given')
            done()
        })
    });
});
describe('Config validateCommand', () => {
    it('should validate command sucessfully', (done) => {
        config.validateCommand('zip -r <filename>.zip <files>', ['arg1', 'arg2']).then(valid => {
            expect(valid).to.be.true
            done()
        }).catch(error => {
            done(error)
        })
    });
    it('should validate command with empty args sucessfully', (done) => {
        config.validateCommand('git status', []).then(valid => {
            expect(valid).to.be.true
            done()
        }).catch(error => {
            done(error)
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
describe('Config generateZshCompletions', () => {
    var writeFileSync = undefined
    var appendFileSync = undefined
    it('should generate zsh completions file', (done) => {
        writeFileSync = sinon.stub(fs, 'writeFileSync').returns({});
        appendFileSync = sinon.stub(fs, 'appendFileSync').returns({});
        config.generateZshCompetions().then(() => {
            expect(writeFileSync.firstCall.args[1]).to.be.equal('#compdef _ali ali')
            expect(appendFileSync.getCall(1).args[1]).to.be.equal('\nfunction _ali {')
            expect(appendFileSync.getCall(6).args[1]).to.be.equal('\n\tcase $state in')
            expect(appendFileSync.getCall(11).args[1]).to.be.equal('\n\t\tlevel2)')
            expect(appendFileSync.getCall(15).args[1]).to.be.equal('\n\t\tlevel3)')
            expect(appendFileSync.getCall(18).args[1]).to.be.equal('\n\tesac')
            done()
        }).catch(error => {
            done(error)
        })
    });
    afterEach(() => {
        writeFileSync.restore()
        appendFileSync.restore()
    })
});
describe('Config shouldZshGenerateCompletions', () => {
    var statSync = undefined
    it('should return true', (done) => {
        statSync = sinon.stub(fs, 'statSync')
        statSync.onCall(0).returns({ mtime: 0 })
        statSync.onCall(1).returns({ mtime: 1 })
        config.shouldGenerateZshCompletions().then(result => {
            expect(statSync).to.be.called
            expect(result).to.be.true
            done()
        }).catch(error => {
            done(error)
        })
    });
    it('should return false', (done) => {
        statSync = sinon.stub(fs, 'statSync')
        statSync.onCall(0).returns({ mtime: 1 })
        statSync.onCall(1).returns({ mtime: 0 })
        config.shouldGenerateZshCompletions().then(result => {
            expect(statSync).to.be.called
            expect(result).to.be.false
            done()
            statSync.restore()
        }).catch(error => {
            done(error)
            statSync.restore()
        })

    });
    afterEach(() => {
        statSync.restore()
    })
});