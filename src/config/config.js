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

exports.validateCommand = (cmd, args) => {
    return new Promise((resolve) => {
        var count = (cmd.match(/<\w*>/g) || []).length;
        resolve(count === args.length)
    })
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

// TODO: Have a timestamp file to check if we need to update completions.
exports.generateZshCompetions = () => {
    return new Promise((resolve) => {
        var ali = path.resolve(process.env.HOME+'/.config/ali/config.yml')
        if (process.env.NODE_ENV === 'test') {
            ali = path.resolve('./test/config/_ali')
        }

        fs.writeFileSync(ali, "#compdef _ali ali");

        writeLine(ali, "")
        writeLine(ali, "function _ali {")
        writeLine(ali, "\tlocal state")
        writeLine(ali, "")
        let _descriptions = writeLevels(ali)
        writeLine(ali, "")
        writeLine(ali, "\tcase $state in")
        _descriptions.forEach(function(l) { 
            writeLine(ali, l)
        })
        writeLine(ali, "\tesac")
        writeLine(ali, "}")
        resolve()
    });
}

function writeLevels(ali) {
    var yml = path.resolve(process.env.HOME+'/.config/ali/config.yml')
    if (process.env.NODE_ENV === 'test') {
        yml = path.resolve('./test/config/config.yml')
    }

    let file = fs.readFileSync(yml)
    var data = yaml.safeLoad(file);

    var levels = []

    addLevels(levels, data, 0)

    levels.sort((a, b) => (a.level > b.level) ? 1 : -1)

    var currentLevel = 0
    var _arguments = "\t_arguments"
    var _lines = []

    levels.forEach(function(l) {
        if (l['level'] > currentLevel) {
            currentLevel = l['level']
            _arguments += " '"+currentLevel+": :->level"+currentLevel+"'"
            if (_lines.length > 0) {
                _lines.push("\t\t;;")
            }
            _lines.push("\t\tlevel"+currentLevel+")")
        }

        _lines.push("\t\t\t_describe 'comand' \"('"+l['alias']+":"+l["cmd"]+"')\"")
    })

    _lines.push("\t\t;;")

    writeLine(ali, _arguments)

    return _lines
}

function writeLine(file, line) {
    fs.appendFileSync(file, '\n'+line); 
}

function addLevels(levels, data, level) {
    if (Object.keys(data).length == 1) {
        return
    }
    level++
    Object.keys(data).forEach(function(key) {
        let d = data[key]
        if (d.hasOwnProperty('cmd') && d.hasOwnProperty('description')) { 
            levels.push({alias: key, cmd: d['cmd'], desciption: d['description'], level:level})
        }
        addLevels(levels, d, level)
    })
}
