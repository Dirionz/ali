'use strict'

exports.parse = (command, args) => {
    return command.replace(/<\w*>/g, args.join(' ').trim())
                  .replace(/  /g, " ")
}