'use strict'
const HashMap = require('hashmap');

class Commands {
    constructor() {
        this.map_full_names = new HashMap()
        this.map_commands = new HashMap()
    }
}

module.exports = Commands;
