const dotenv = require('dotenv').config({path: '../config/config.env'});

const PORT =process.env.SERVER_PORT;


const server = require('http').createServer();
const itms = require('./items.js'); //consider converting
const zoneManager = require('./zone-manager.js');
const invent = require('./inventory.js');

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
                base: items.bronzehelm,
                plus:0
            },
            BODY: {
                base: items.jacket,
                plus:1
            },
            WEAPON: {
                base: items.dspear,
                plus:1
            },
            OFFHAND: undefined,
            LEGS: {base: items.goldlegs,
                plus: 1
            },
            BOOTS: undefined
        }
    }
};

inventories ={
    0:[{base:items.seeradish,quantity:1, plus:0},
        {base:items.goldhelm,quantity:1, plus:6}
    ]
}

class PlayerStats {
    constructor(health, experience, zone) {
        this.maxHealth = health;
        this.health = health;
        this.experience = experience;
    }

}

class PlayerLocation{
    constructor(zone, pos){
        this.zone = zone;
        this.pos = pos;
    }
}



let firstZone = new zoneManager.Zone(0);
let secondZone = new zoneManager.Zone(1);
let thirdZone = new zoneManager.Zone(2);


global.ZONES = {0:firstZone,1:secondZone, 2: thirdZone}

io.on('connect', function(client) {

    let curr_username;

    client.on('login',function(username,password){
        curr_username = username
        let playerStats = new PlayerStats(200,200, 0);
        client.character = {};
        client.playerStats = playerStats;
        client.playerLocation = new PlayerLocation(0, {x:150,y:150})
        client.character.invent = {};
        tryLogin(client, username, password); 
    });

    client.on('joinzone',function(data) {
        firstJoin(client, curr_username, client.playerLocation);

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
            let zone = ZONES[client.playerLocation.zone];
            zone.pickup(client, id);
        });

        client.on('clickPaperDoll',function(data) {
            let slot = data.slot;
            let action = data.action; //TODO: use messaging action
            client.character.invent.actOnPaperDollSlot(slotActions.CLICK, slot);
            client.emit("myInventory", client.character.invent.message);
        });

        client.on('clickInventorySlot',function(data) {
            let slot = data.slot;
            let action = slotActions[data.action];
            let zone = ZONES[client.playerLocation.zone];
            let playerPos = client.playerLocation.pos;
            client.character.invent.actOnInventorySlot(action, slot, zone, playerPos);
            client.emit("myInventory", client.character.invent.message);
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
                                //TODO: register appearance as animkey, plus/effect and base
                                //client.character.paperDoll = new invent.paperDoll(chars2[0].character.paperDoll);
                                client.character.appearance = chars2[0].base // more in here later
                                client.character._id = chars2[0]._id || randomInteger(0, 9999999); //temp
                                return resolve(true);
                            })
                        }else{
                            console.log("Something went horribly wrong when creating character")
                            return resolve(false);

                        }
                    })
                }else{
                    //client.character.paperDoll = new invent.paperDoll(char[0].character.paperDoll);
                    client.character.appearance = char[0].character.base;// more in here later
                    // TODO: use as database doc key
                    client.character._id = char[0]._id || randomInteger(0, 9999999); //temp
                    return resolve(true)
                }
            })
        }else{

            let invManager = new invent.InventoryManager(inventories[0], players[0].paperDoll);

            client.character.invent = invManager; //paperDoll = new invent.PaperDoll(players[0].paperDoll);
            client.character.appearance = players[0].base;// more in here later
            client.character._id =  randomInteger(0, 9999999); //temp
         //   console.log(client.character)
            return resolve(true)
        }

    });
}


function firstJoin(client, username, playerLocation){
    console.log("Try join attempted")
    let zone = ZONES[playerLocation.zone];
    zone.join(client, playerLocation.zone, undefined, client);
}



function tryJoinZone(clientID, targetZoneID, playerLocation, position){
    let zone = ZONES[targetZoneID];
    zone.join(clientID, playerLocation, playerLocation.zone,undefined, position);
}


global.testZoneJoin = function(clientID, playerLocation, zoneID, position){
    tryJoinZone(clientID, zoneID, playerLocation, position)
}

global.killPlayer = function(clientID, currentzoneID){
    let zone = ZONES[currentzoneID];
    let client = zone.zoneSender.clientLookup[clientID]
    zone.physicsWorld.removeEntity(client.player.config.key);

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

global.distance = function(pointA, pointB){
    let a = pointA.x - pointB.x;
    let b = pointA.y - pointB.y;

    let c = Math.sqrt( a*a + b*b );
    return c;
}