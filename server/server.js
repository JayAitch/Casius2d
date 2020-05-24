const dotenv = require('dotenv').config({path: '../config/config.env'});

const PORT =process.env.SERVER_PORT;


const server = require('http').createServer();
const items = require('./items.js'); //consider converting
const zoneManager = require('./zone-manager.js')
const invent = require('./inventory.js')
const dbDisabled = true;

global.io = require('socket.io')(server);
io = global.io;

// const dbManager = require('./db-connection.js')

const xDbManager = require('./persistance-manager.js')

// xDbManager.databaseConnection.createAccount("user2","somesionms").then(done =>{
//     console.log("I dided it?: " + done)
// })

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

inventories ={
    0:[{id:0,quantity:1}]
}



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
        client.playerInventory = new invent.Inventory(inventories[0]);
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

            client.on('pickup',function(id) {
                client.zone.pickup(client, id);
            });
        });
    });

    client.on('createaccount', function(username,password){
        xDbManager.databaseConnection.createAccount(username,password).then(function(accountExists){
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

        let loginPromise = xDbManager.databaseConnection.requestLogin(username,password);
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
        // let characterPromise = dbManager.databaseConnection.createOrReturnCharacter(username,1,1,0);
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
    let zoneid = client.playerStats.zone;
    let zone = ZONES[zoneid];
    zone.physicsWorld.removeEntity(client.player.entityPos);

    let testRespawn = setTimeout(function() {
        global.respawn(client);
        clearTimeout(testRespawn);
    }, 2000);
}

global.respawn = function(client){
    let zoneid = client.playerStats.zone;
    client.playerStats.health = client.playerStats.maxHealth;
    let zone = ZONES[zoneid];
    zone.join(client,{x:150,y:150});
}

global.randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}