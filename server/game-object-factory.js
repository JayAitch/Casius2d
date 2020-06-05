const characters = require('./server-characters.js');
global.entityTypeLookup = {"PLAYER":"player", "PIG":"pig", "NONPASSIBLE":"nonPassible", "TRIGGER_ZONE_CHANGE":"portal", "BASENODE":"baseNode", "SHOPKEEPER":"shopKeeper"}

entityTypes = {
    "player": {
        id: "player",
        constructor: characters.ServerPlayer
    },
    "pig":{
        id: "pig",
        constructor: characters.BasicMob
    },
    "nonPassible":{
        id:"nonPassible",
        constructor: characters.NonPassibleTerrain
    },
    "portal":{
        id:"portal",
        constructor: characters.ZonePortal
    },
    "baseNode":{
        id:"baseNode",
        constructor: characters.BasicResource
    },
    "shopKeeper":{
        id:"shopKeeper",
        constructor: characters.ShopKeeper
    }

}

class Factory {
    constructor(collisionManager, itemWorld) {
        this.collisionManager = collisionManager;
        this.itemWorld = itemWorld;
    }
    new(params){
        let type = params.type;
        let constructor = entityTypes[type].constructor
        let config = params.config;
        let entity = new constructor(this.collisionManager, config); // TODO: this is missing drop callback for mobs
        return entity || false;
    }
}


module.exports = { Factory};