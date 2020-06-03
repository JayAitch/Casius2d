const characters = require('./server-characters.js');


nodeLookup = {
    "rock_iron":{
        "drop": "rock_iron_1",
        "class": characters.BasicResource,
        "reward": {"type": skillLevels.MINING, "amount":15}

    },
    "wood_magic":{
        "drop": "wood_magic_1",
        "class": characters.BasicResource,
        "reward": {"type": skillLevels.WOODCUTTING, "amount":15}
    }
}

entityTypes = {
    "player": {
        id: "player",
        type: characters.ServerPlayer
    },
    "pig":{
        type: characters.BasicMob,
        drop: "pig"
    }

}
let factory = function(colManager, itemWorld){
    return new Factory(colManager, itemWorld);
}


class Factory {
    constructor(collisionManager, itemWorld) {
        this.collisionManager = collisionManager;
        this.itemWorld = itemWorld;
    }
    new(params){
        let type = params.type;
        let config = params.config;
        let enity = new type(this.collisionManager, config); // TODO: this is missing drop callback for mobs
        return enity || false;
    }
}


module.exports = { factory };


new objClass(this.collisionManager,correctPos, drop,  this.zoneid, reward);
new characters.ZonePortal(correctPos, object.width,object.height,this.collisionManager, object.zone, object.x,object.y);
characters.NonPassibleTerrain(correctPos, object.width, object.height, this.collisionManager);
new type(this.collisionManager, droptest);


testCreateMobLots(times){
    for(let i = 0; i < times; i++){
        let callBack = (pos)=>{
            this.itemWorld.addItem(pos,dropManager.roleDrop(0));
            let timedcallback = setTimeout(() => {
                this.testCreateMobLots(1);
                clearTimeout(timedcallback);
            }, 2000)
        }
        this.physicsWorld.testCreateMob(callBack, characters.BasicMob);
    }
}

addPlayerCharacter(client, deathcallback){
    let entityKey = this.lastEntityId;
    let playerConfig = {
        inventory: client.character.invent,
        appearance: client.character.appearance,
        paperDoll: client.character.invent.paperDoll,
        key: entityKey,
        stats: client.playerStats,
        location: client.playerLocation,
        _id: client.character._id,
        deathCallback: deathcallback //temp
    }

    let newPlayer = new characters.ServerPlayer(playerConfig, this.collisionManager);
    this.entities[entityKey] = newPlayer;
    this.lastEntityId++
    return newPlayer;
}

testCreateMob(droptest, type){
    this.testMob = new type(this.collisionManager, droptest);
    this.entities[this.lastEntityId] = this.testMob;
    this.sender.notifyNewEntity(this.testMob, this.lastEntityId);
    this.lastEntityId++
}

/// TODO move to zone factory
createFromJSON(objects){
    objects.forEach((object)=>{
        let x = object.pos.x + object.width/2;//temp
        let y = object.pos.y + object.height/2;
        let correctPos = {x:x,y:y};
        switch(object.type){
            case "NONPASSIBLE":
                let testNonPassible = new characters.NonPassibleTerrain(correctPos, object.width,object.height,this.collisionManager);
                break;
            case "TRIGGER_ZONE_CHANGE":
                let testZonePortal = new characters.ZonePortal(correctPos, object.width,object.height,this.collisionManager, object.zone, object.x,object.y);
                break;
            case "NODE":
                // todo - make this better
                let lookup = nodeLookup[object.node_id];
                let objClass = lookup.class;
                let drop = lookup.drop;
                let reward = lookup.reward;
                let testNode = new objClass(this.collisionManager,correctPos, drop,  this.zoneid, reward);
                this.entities[this.lastEntityId] = testNode;
                this.lastEntityId++;
        }

    })

}