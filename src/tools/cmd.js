var exec = require('child_process').exec;
const spawn = require('child_process').spawn;

var commandline={
    run:runCommand,
    start:startCommand,
    cmd:cmd,
    runEvent:runEventCommand
};

function runCommand(command,callback){
    exec(
        command,
        (
            function(){
                return function(err,data,stderr){
                    
                    if(!callback)
                        return;
                    callback(stderr, data.trim());
                }
            }
        )(callback)
    );
}

function startCommand(command, args, callback) {
    const ls = spawn(command, args, { stdio: 'inherit' });

    ls.on('close', (code) => {
        if(!callback)
            return;
        if (code == 0) {
           callback();
        } else {
            callback('Error code: '+code);
        }
    });

    ls.on('error', (err) => {
        if(!callback)
            return;
        callback(err);
    })

    process.on('SIGINT', function() {
        ls.kill('SIGINT');
    });

}

function cmd(command, callback) {
    console.log("Running: "+command)
    const ls = spawn(command, { stdio: 'inherit', shell: true});

    ls.on('close', (code) => {
        if(!callback)
            return;
        if (code == 0) {
           callback();
        } else {
            callback('Error code: '+code);
        }
    });

    ls.on('error', (err) => {
        if(!callback)
            return;
        callback(err);
    })

    process.on('SIGINT', function() {
        ls.kill('SIGINT');
    });

}

function runEventCommand(command, args, callback) {
    const ls = spawn(command, args);
    ls.stdout.on('data', (data) => {
       //logger.verbose(data.toString());
    });

    ls.stderr.on('data', (data) => {
        // logger.verbose(data.toString());
    });

    ls.on('close', (code) => {
        // logger.verbose('Exit code: ' + code.toString());
    });
}

module.exports=commandline;



