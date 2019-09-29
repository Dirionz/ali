#!/usr/bin/env node
'use strict'
process.env.NODE_ENV = 'debug';

const Commands = require('./models/Commands.js')

const commander = require('./tools/commander.js')
const parsecmd = require('./tools/parsecmd.js')

const fs = require('fs');
const yaml = require('js-yaml');
const HashMap = require('hashmap');

var path = require('path');
let yml = path.resolve(__dirname) + '/ali.yml'
var data = yaml.safeLoad(fs.readFileSync(yml, 'utf8'));

let space = '      ';
let help_example = '\n  Usage:\n      ali <alias> <command|alias>\n\n'
let help_command_title = '\n  Commands:\n\n'
var help_str = help_example + help_command_title

help_str = help_str + space + "version"+ '\n'
help_str = help_str + space.repeat(3) + "Show version number" + '\n'

var map_managers = new HashMap()
var map_alias_managers = new HashMap()
var arr_manager_has_save = []

for (var k in data) {

    let commands = new Commands()

    let cmds = k.split('|')
    let fullname = cmds[0]
    let alias = cmds[1]
    map_alias_managers.set(alias, fullname);
    help_str = help_str + space + fullname+"|"+alias+ '\n'

    let command = undefined
    let description = undefined

    for (var nk in data[k]) {
        if (nk === 'cmd') {
            command = data[k][nk]
        } else if (nk === 'description') {
            description = data[k][nk];
        } else {
            let sub_commands = nk.split('|')
            let sub_fullname = sub_commands[0]
            let sub_alias = sub_commands[1]
            commands.map_full_names.set(sub_alias, sub_fullname)

            let sub_command = undefined
            let sub_description = undefined
            let sub_save = undefined
            for (var nnk in data[k][nk]) {

                switch (nnk) {
                    case 'cmd':
                        sub_command = data[k][nk][nnk]
                        break
                    case 'description':
                        sub_description = data[k][nk][nnk]
                        break
                    case 'save':
                        sub_save = data[k][nk][nnk]
                        break
                }
            }

            if (sub_command && sub_description) {
                commands.map_commands.set(sub_fullname, sub_command)
                help_str = help_str + space.repeat(3) + sub_fullname + '|' + sub_alias + space.repeat(1) + '\t' + sub_description + '\n'
                if (sub_save) {
                    help_str = help_str + space.repeat(6) + '\t--save\t' + sub_save + '\n'
                    arr_manager_has_save.push(fullname+sub_command)
                }
            }
        }

        if (command && description) {
            commands.map_commands.set(fullname, command)
            help_str = help_str + space.repeat(3) + fullname + '|' + alias + space.repeat(1) + '\t' + description + '\n'
        }
    }

    map_managers.set(fullname, commands)
    map_managers.set(alias, commands)
}

if (!process.argv.slice(2).length) {
    console.log(help_str)
} else {
    let commandStr = process.argv[2]
    switch (commandStr) {
        case '--version':
            console.log(require('../package.json').version)
            process.exitCode = 0
            break
        case '--help':
            console.log(help_str)
            break
        default:        
            managerCmd(commandStr).then(
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
// Manager --------------------------------------------------------------------------
async function managerCmd(commandStr) {
    return new Promise(async resolve => {

        let ali = map_alias_managers.get(commandStr)

        if (ali === undefined) {
            ali = commandStr
        }

        var argIndex = 3

        let command = map_managers.get(commandStr);

        var str = command.map_commands.get(ali)
        if (str === undefined)
            str = command.map_commands.get(command.map_full_names.get(ali))

        if (str === undefined) {
            let sub_ali = process.argv[3]
            argIndex+=1
            str = command.map_commands.get(sub_ali)
            if (str === undefined)
                str = command.map_commands.get(command.map_full_names.get(sub_ali))
        }

        let args = process.argv.slice(argIndex, process.argv.length)

        const res = await commander.cmd(parsecmd.parse(str, args))

        resolve()
    })
}