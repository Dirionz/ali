'use strict'
var cmd=require('./cmd');

exports.cmd = (command, args) => {
    return new Promise((resolve, reject) => {
        cmd.cmd(command, function(err, data) {
            if (err) { 
                reject(err)
            } else {
                resolve(data)
            }
        });
    })
}
