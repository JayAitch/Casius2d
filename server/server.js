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


class PlayerStats {
    constructor(health, experience) {
        this.maxHealth = health;
        this.health = health;
        this.experience = experience;
    }

}





let firstZone = new zoneManager.Zone(0);
let secondZone = new zoneManager.Zone(1);

const ZONES = {0:firstZone,1:secondZone}

io.on('connect', function(client) {

    client.on('login',function(username,password){
        let playerStats = new PlayerStats(200,200);
        client.playerStats = playerStats;
        tryLogin(client, username, password);

        client.on('joinzone',function(data) {
            tryJoinZone(client, username, 0,{x:250,y:250});

            client.on('stop',function() {
                client.player.stop();
            });

            client.on('move',function(data) {
                client.player.addMovement({x:data.x, y:data.y});
            });

            client.on('attack',function(data) {
                client.player.attack();
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

function tryJoinZone(client, username, zoneid, position){
    if(!dbDisabled){
        let characterPromise = dbManager.databaseConnection.createOrReturnCharacter(username,1,1,0);
        characterPromise.then(function (character) {

            if(client.zone)client.zone.leave(client);
            let zone = ZONES[zoneid];
            zone.join(client,position);
        }).catch((err)=>{
            console.log(err);
        })
    }
    else{
        if(client.zone)client.zone.leave(client);
        let zone = ZONES[zoneid];
        zone.join(client,position);
    }
}

global.testZoneJoin =function(client, username, zoneid, position){
    tryJoinZone(client, username, zoneid, position)
}

global.killPlayer = function(client){
    console.log("killing player");
    let zoneid = client.playerStats.zone;
    let zone = ZONES[zoneid];
    zone.killEntity(client.player.entityPos);
}