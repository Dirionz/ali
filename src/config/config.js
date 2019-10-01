'use strict'
const fs = require('fs');
const yaml = require('js-yaml');
var path = require('path');

exports.findCommand = (args) => {
    return new Promise((resolve, reject) => {
        var yml = path.resolve(process.env.HOME+'/.config/ali/config.yml')
        if (process.env.NODE_ENV === 'test') {
            yml = path.resolve('./test/config/config.yml')
        }
        let file = fs.readFileSync(yml)
        var data = yaml.safeLoad(file);

        // FIXME: Before this function use -a|--args to split from rest of arguments

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

        // FIXME: --help basically return the config.yml + syntax

        resolve(data)
        
    })
}