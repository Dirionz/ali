'use strict'
const fs = require('fs');
const yaml = require('js-yaml');
var path = require('path');

exports.findCommand = (args) => {
    return new Promise((resolve) => {
        var yml = path.resolve(process.env.HOME+'/.config/ali/config.yml')
        if (process.env.NODE_ENV === 'test') {
            yml = path.resolve('./test/config/config.yml')
        }
        let file = fs.readFileSync(yml)
        var data = yaml.safeLoad(file);

        args.forEach(function(arg) {
            var existKey = null
            Object.keys(data).forEach(function(key) { 
                var keys = key.split('|')
                var foundKey = null
                keys.forEach(function(plainKey) {
                    if (plainKey === arg) {
                        foundKey = key
                        return
                    }
                })

                if (foundKey != null) {
                    existKey = foundKey
                    return
                }
            })

            if (existKey == null) {
                throw "Key not found"
            }
            
            data = data[existKey]
        }); 
        
        if (data == null || !data.hasOwnProperty('cmd') || !data.hasOwnProperty('description')) {
            throw "Command not found"
        }

        resolve(data)
        
    })
}

exports.splitArgs = (args) => {
    return new Promise((resolve) => {
        let path = []
        let rest = []
        let before = true
        args.forEach(function(arg) { 
            if (arg === '-a' || arg === '--args') {
                before = false                
            } else {
                if (before) {
                    path.push(arg)
                } else {
                    rest.push(arg)
                }
            }
        })

        if (!before && rest.length == 0) {
            throw "No arguments given"
        }
        resolve([path, rest])
    })
}

// FIXME: Args same as cmds <>
exports.validateCommand = () => {
}

exports.getHelpText = () => {
    return new Promise((resolve) => {
        var helpText = "\n";
        helpText += "usage: ali [Command|Alias] -a [args]\n"

        var yml = path.resolve(process.env.HOME+'/.config/ali/config.yml')
        if (process.env.NODE_ENV === 'test') {
            yml = path.resolve('./test/config/config.yml')
        }
        let file = fs.readFileSync(yml)

        helpText += "\n"
        helpText += file

        resolve(helpText)
    });
}
