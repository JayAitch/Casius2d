const configs = require("../config/configs.js")
const PORT = configs.server_config.port;


const server = require('http').createServer();
const items = require('./items.js'); //consider converting
const zoneManager = require('./zone-manager.js')
const dbDisabled = true;

global.io = require('socket.io')(server);
io = global.io;

const dbManager = require('./db-connection.js')

players = {
    0:{
        base:"basecharacter",
        paperDoll:{
            HEAD: {
                base: items.data.goldhelm,
                plus:6
            },
            BODY: {
                base: items.data.jacket,
                plus:1
            },
            WEAPON: {
                base: items.data.dspear,
                plus:1
            },
            OFFHAND: undefined,
            LEGS: {base: items.data.goldlegs,
                plus: 1
            },
            BOOTS: undefined
        }
    }
};







let firstZone = new zoneManager.Zone();
let secondZone = new zoneManager.Zone();


io.on('connect', function(client) {

    client.on('login',function(username,password){

        tryLogin(client, username, password);

        client.on('joinzone',function(data) {
            tryJoinZone(client, username);

            client.on('stop',function() {
                client.player.stop();
            });

            client.on('move',function(data) {
                client.player.addMovement({x:data.x, y:data.y});
            });
        });
    });

    client.on('createaccount', function(username,password){
        dbManager.databaseConnection.createAccount(username,password).then(function(accountExists){
            console.log(accountExists);
            if(!accountExists){
                console.log("Account created!")
            }else{
                console.log("Account already exists!")
            }


        });
    });


    client.on('disconnect', function(){
    });

});


server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});















function tryLogin(client, username, password){
    if(!dbDisabled){

        let loginPromise = dbManager.databaseConnection.requestLogin(username,password);
        loginPromise.then((doesExist) => {
            if(doesExist){
                client.emit('loggedIn');
            }
        })
    }
    else{
        client.emit('loggedIn');
    }
}

function tryJoinZone(client, username){
    if(!dbDisabled){
        let characterPromise = dbManager.databaseConnection.createOrReturnCharacter(username,1,1,0);
        characterPromise.then(function (character) {
            firstZone.join(client);
        }).catch((err)=>{
            console.log(err);
        })
    }
    else{
        firstZone.join(client);
    }
}
