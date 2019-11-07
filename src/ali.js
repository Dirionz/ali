#!/usr/bin/env node
'use strict'
process.env.NODE_ENV = 'test';

const Command = require('./models/Command.js')

const commander = require('./tools/commander.js')
const parsecmd = require('./tools/parsecmd.js')
const config = require('./config/config')

if (!process.argv.slice(2).length) {
    config.getHelpText().then(helpText => {
        console.log(helpText)
        process.exitCode = 0
    }).catch(error => {
        console.log(error)
        process.exitCode = 1
    })
} else {
    let commandStr = process.argv[2]
    switch (commandStr) {
        case '--version':
            console.log(require('../package.json').version)
            process.exitCode = 0
            break
        case '--help':
            config.getHelpText().then(helpText => {
                console.log(helpText)
                process.exitCode = 0
            }).catch(error => {
                console.log(error)
                process.exitCode = 1
            })
            break
        default:        
            handleCommand(process.argv.splice(2)).then(
                () => {
                    process.exitCode = 0
            }).catch(error => {
                console.log(error)
                process.exitCode = 1
            })
    }
}

process.on('unhandledRejection', function(reason, promise) {
    console.log(reason)
    process.exitCode = 1
});

//-----------------------------------------------------------------------------------
// Command --------------------------------------------------------------------------
async function handleCommand(args) {
    return new Promise(async resolve => {

        let pathArgs = await config.splitArgs(args)

        let data = await config.findCommand(pathArgs[0])
        let command = Object.assign(new Command(), data);

        if (await config.shouldGenerateZshCompletions()) {
            await config.generateZshCompetions()
        }

        if (await config.validateCommand(command.cmd, pathArgs[1])) {
            const res = await commander.cmd(parsecmd.parse(command.cmd, pathArgs[1]))
            resolve()
        } else {
            throw "Invalid command"
        }
    })
}