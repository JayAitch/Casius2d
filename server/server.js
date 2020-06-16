const dotenv = require('dotenv').config({path: '../config/config.env'});

const PORT =process.env.SERVER_PORT;

global.skillLevels = {"WOODCUTTING":"WOODCUTTING","MINING":"MINING","BLACKSMITH":"BLACKSMITH", "COMBAT":"COMBAT", "ALCHEMY":"ALCHEMY", "CRAFTING":"CRAFTING"}
const server = require('http').createServer();
const itms = require('./items.js'); //consider converting
const zoneManager = require('./zone-manager.js');
const invent = require('./inventory.js');
const playerStats = require('./player-stats.js')
const dbDisabled = true;
const bank = require('./bank-inventory.js')

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
            HEAD: undefined,
            BODY:undefined,
            WEAPON: undefined,
            OFFHAND: undefined,
            BELT:undefined,
            LEGS: undefined,
            BOOTS: undefined
        }
    }
};

// players = {
//     0:{
//         base:"basecharacter",
//         paperDoll:{
//             HEAD: {
//                 base: items.bronzehelm,
//                 plus:0
//             },
//             BODY: {
//                 base: items.jacket,
//                 plus:1
//             },
//             WEAPON: {
//                 base: items.dspear,
//                 plus:1
//             },
//             OFFHAND: undefined,
//             LEGS: {base: items.goldlegs,
//                 plus: 1
//             },
//             BOOTS: undefined
//         }
//     }
// };
// temp
banks = {
    0:{
        gold: 10000000000000000000,
        items: [
            {base:items.goldhelm,quantity:1, plus:12},
        ]
    }
}

inventories = {
    01212:[{base:items.seeradish,quantity:1, plus:0},
        {base:items.goldhelm,quantity:1, plus:6},
        {base:items.goldhelm,quantity:1, plus:600},
        {base:items.goldmask,quantity:1, plus:3},
        {base:items.goldmask,quantity:1, plus:4},
        {base:items.jacket,quantity:1, plus:2},
        {base:items.bronzehelm,quantity:1, plus:600},
        {base:items.jacket,quantity:1, plus:4},
        {base:items.jacket,quantity:1, plus:6}
    ],
    0:{
        gold: 10000000000000000000,
        items: [
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0},
            {base:items.goldbar,quantity:1, plus:0}
        ]
    }
}


// this could be used along with id to get the room etc
class PlayerLocation{
    constructor(zone, pos){
        this.zone = zone;
        this.pos = pos;
    }
}


// TODO: move messaging to a class via this
global.serverSender = {
    wholeRoom:function(hook, data, playerLocation) {
        this.getRoom(playerLocation).roomMessage(hook, data);
    },

    getRoom:function(playerLocation) {
        let zone = ZONES[playerLocation.zone];
        return zone.zoneSender.room;
    },

    getZone:function(playerLocation) {
        let zone = ZONES[playerLocation.zone];
        return zone;
    },

    zoneMessage:function(hook,data,playerLocation){
       // this.getSender(playerLocation);
        //zoneSender.notfiyEnitityReload();
    },
    //temp
        //// temp/////
    propigateReload: function(key, playerLocation){
        let zone = this.getZone(playerLocation);
        zone.triggerEntityReload(key);
    },


    broadCastRoom:function(hook,data, playerLocation, id){
        this.getRoom(playerLocation).broadcastMessageViaID(id,hook, data);
    },

    clientMessage:function(hook, data, playerLocation, id){
        let room = this.getRoom(playerLocation);
        let client = room.clientLookup[id];
        client.emit(hook, data);
    }
}



let firstZone = new zoneManager.Zone(0);
let secondZone = new zoneManager.Zone(1);
let thirdZone = new zoneManager.Zone(2);


global.ZONES = {0:firstZone,1:secondZone, 2:thirdZone}




io.on('connect', function(client) {

    let curr_username;

    client.on('login',function(username,password){
        curr_username = username


        ////// TEMP

        let skills = {
            [skillLevels.MINING]:0,
            [skillLevels.CRAFTING]:0,
            [skillLevels.COMBAT]:10,
            [skillLevels.BLACKSMITH]:0,
            [skillLevels.ALCHEMY]:0,
            [skillLevels.WOODCUTTING]:0,
        }
        let callbacks = {
            levelUp: function(skill){
                tempLevelMessage(client,skill);
            },
            gainedEXP: function(skill){
                tempEXPGainMessage(client,skill);
            }
        }
        //
        let mplayerStats = new playerStats.PlayerStats(200,skills, 5, 30, callbacks); //these now recalculate





        client.character = {};
        client.playerStats = mplayerStats;
        client.playerLocation = new PlayerLocation(0, {x:150,y:150});
        tryLogin(client, username, password);
    });

    client.on('joinzone',function(data) {
        firstJoin(client, curr_username, client.playerLocation);

        client.on('stop',function() {
            client.player.movementComponent.stop();
        });

        client.on('move',function(data) {
            client.player.movementComponent.addMovement({x:data.x, y:data.y});
        });

        client.on('attack',function(data) {
            client.player.attack();
        });

        client.on('pickup',function(id) {
            let zone = ZONES[client.playerLocation.zone]
            zone.pickup(client, id);
        });


        client.on('clickShopSlot',function(data) {
            let action = data.action // todo
            let zone = ZONES[client.playerLocation.zone]
            zone.buyItem(client, data.key, data.slot, data.options);// todo add this to shop
        });


        client.on('clickPaperDoll',function(data) {
            let slot = data.slot;
            let action = data.action; //TODO: use messaging action
            client.character.invent.actOnPaperDollSlot(slotActions.CLICK, slot);
          //  client.emit("myInventory", client.character.invent.message);
        });


        client.on('craftRecipe',function(lookup) {
            let zoneid = client.playerLocation.zone;
            let zone = ZONES[zoneid];

            let inRangeCheck = ()=>{
                let inRange = zone.isInRangeOfCrafting("category", client.player); // todo: check for specific bench types
                return inRange;
            }
            recipesManager.tryToCraft(lookup, client.character.invent, client.playerStats, inRangeCheck);


        });


        client.on('clickInventorySlot',function(data) {

            let slot = data.slot;
            console.log(data);
            let action = slotActions[data.action];
            let zone = ZONES[client.playerLocation.zone];
            if(data.action === "SELL") {
                zone.sellItem(client, data.id, slot, data.options);
            }
            else{
                let playerPos = client.playerLocation.pos;
                client.character.invent.actOnInventorySlot(action, slot, zone, playerPos, client.character.bank, data.options);
            }

           // client.emit("myInventory", client.character.invent.message);
        });

        client.on('clickBankSlot',function(data) {
            let zoneid = client.playerLocation.zone;
            let zone = ZONES[zoneid];
            let inRange = zone.isInRangeOfBank(client.player);
            if(inRange){
                let slot = data.slot;
                let action = slotActions[data.action];
                client.character.bank.actOnBankSlot(action, slot, client.character.invent, data.options);
            }
        });


    });

    client.on('createaccount', function(username,password){
        xDbManager.databaseConnection.createAccount(username,password).then(accountCreated => {
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
// todo move this
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
                                //client.character.paperDoll = chars2[0].character.paperDoll;
                                //client.character.appearance = chars2[0].base // more in here later
                               // client.character._id = chars2[0]._id || randomInteger(0, 9999999); //temp
                                return resolve(true);
                            })
                        }else{
                            console.log("Something went horribly wrong when creating character")
                            return resolve(false);

                        }
                    })
                }else{

                    let invManager = new invent.InventoryManager(inventories[0], players[0].paperDoll);
                    client.character.invent = invManager;

                    client.character.appearance = char[0].character.base;// more in here later
                    // TODO: use as database doc key
                    client.character._id = char[0]._id || randomInteger(0, 9999999); //temp
                    return resolve(true)
                }
            })
        }else{
            client.character.appearance = players[0].base;// more in here later
            client.character._id =  randomInteger(0, 9999999); //temp
            let invManager = new invent.InventoryManager(inventories[0], players[0].paperDoll, client.playerLocation,  client.character._id, client.playerStats);
            client.character.invent = invManager;
            let bankManager = new bank.BankManager(banks[0], client.playerLocation, client.character._id);
            client.character.bank = bankManager;
            return resolve(true)
        }

    });
}


function firstJoin(client, username, playerLocation){
    console.log("Try join attempted")
    let zone = ZONES[playerLocation.zone];
    zone.join(client, playerLocation.zone, undefined, client);
}


// temp
function tempLevelMessage(client, skill){
    let zone = ZONES[client.playerLocation.zone];
    let hook = "levelUp";
    let data = skill;
    data.key = client.character._id;
    serverSender.wholeRoom(hook, data, client.playerLocation);

}

// temp
function tempEXPGainMessage(client, skill){
    serverSender.clientMessage("skills", client.playerStats.skills.skills , client.playerLocation, client.character._id);
}


function tryJoinZone(clientID, targetZoneID, playerLocation, position){
    let zone = ZONES[targetZoneID];
    zone.join(clientID, playerLocation, playerLocation.zone,undefined, position);
}


global.testZoneJoin = function(clientID, playerLocation, zoneID, position){
    tryJoinZone(clientID, zoneID, playerLocation, position)
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

global.sendAOEDebug = function(zoneid, pos, width, height){
    serverSender.wholeRoom('AOEDebug', {pos:pos,width:width, height:height},{zone:zoneid})
}