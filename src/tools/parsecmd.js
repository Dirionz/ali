'use strict'
var path = require("path")

exports.parse = (command, pkgs) => {
    //let pluginsdir = path.resolve(__dirname, '..') + '/plugins'
    //console.log(command)
    return command.replace(/<arg1>/g, pkgs.join(' ').trim())
                  .replace(/  /g, " ")
}