const dotenv = require('dotenv').config({path: '../config/config.env'});

const PORT =process.env.SERVER_PORT;


const server = require('http').createServer();
const items = require('./items.js'); //consider converting
const zoneManager = require('./zone-manager.js')
const invent = require('./inventory.js')
const dbDisabled = true;

global.io = require('socket.io')(server);
io = global.io;

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

    let curr_username;

    client.on('login',function(username,password){
        curr_username = username
        let playerStats = new PlayerStats(200,200);
        client.playerStats = playerStats;
        client.playerInventory = new invent.Inventory(inventories[0]);
        tryLogin(client, username, password); 
    });

    client.on('joinzone',function(data) {
        tryJoinZone(client, curr_username, 0,{x:250,y:250});

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

    client.on('createaccount', function(username,password){
        xDbManager.databaseConnection.createAccount(username,password).then(accountCreated => {
            console.log(accountCreated);
            if(accountCreated){
                console.log("Account created!")
            }else{
                console.log("Account already exists!")
            }

        });
    });
    //TODO - on disconnect
    client.on('disconnect', function(){});

});

server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

function tryLogin(client, username, password){
    /* If DB is disabled just emit login */
    if(!dbDisabled){
        let loginPromise = xDbManager.databaseConnection.checkLogin(username,password);
        loginPromise.then((doesExist) => {
            if(doesExist){
                setupCharacter(client,username).then(suceeded =>{
                    if(suceeded){
                        client.emit('loggedIn');
                    }
                });
            }
        })
    }
    else{
        setupCharacter(client,username).then(suceeded =>{
            client.emit('loggedIn');
            
        });
    }
}

function setupCharacter(client,username){
    return new Promise((resolve) => {
        if(!dbDisabled){
            let characterPromise = xDbManager.databaseConnection.getAllCharactersForUser(username);

            characterPromise.then((chars) => {
                if(chars == undefined){
                    //* If no characters exist for this account then make one. 
                    xDbManager.databaseConnection.createCharacter(username,players[0]).then((succeeded) =>{
                        if(succeeded){
                            //* Creation succeeded - go ahead and re-query and assign DB properties to character
                            let characterPromise2 = xDbManager.databaseConnection.getAllCharactersForUser(username);
                            characterPromise2.then((chars2) => {
                                //Do something with chars2
                                console.log("Character made!");
                                client.character = chars2[0].character
                                return resolve(true);
                            })
                        }else{
                            console.log("Something went horribly wrong when creating character")
                            return resolve(false);

                        }
                    })
                }else{
                    client.character = char[0].character
                    return resolve(true)
                }
            })
        }else{
            client.character = players[0]
            console.log(client.character)
            return resolve(true)
        }

    });
}

function tryJoinZone(client, username, zoneid, position){
    console.log("Try join attempted")
    if(client.zone)client.zone.leave(client);
    let zone = ZONES[zoneid];
    zone.join(client,position);                      
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