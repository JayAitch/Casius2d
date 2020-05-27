const roomManager = require('./room-manager.js');
const systems = require('./systems.js');
const characters = require('./server-characters.js');
const fs = require('fs');
systems.startUpdate();




function getZoneData(zone){
    let file = ZONEMAPS[zone];
    let rawdata = fs.readFileSync('./tilemaps/'+ file);
    let tilemap = JSON.parse(rawdata);
    return tilemap;
}


ZONEMAPS= {0:"zone1.json",1:"zone2.json"}

function getWorldObjects(id){
    let worldData = getZoneData(id);
    let worldObjects = [];
    worldData.forEach(function(layer){
        layer.objects.forEach(function(object){
            let newObject = {
                width:object.width,
                height:object.height,
                pos: {x: object.x,y:object.y},
                type:object.type,
            }
            let newzone = getProperty(object.properties, "zone");
            if(newzone !== undefined) newObject.zone = newzone;

            let xpos = getProperty(object.properties, "x");
            if(xpos !== undefined) newObject.x = xpos;

            let ypos = getProperty(object.properties, "y");
            if(ypos !== undefined) newObject.y = ypos;



            worldObjects.push(newObject);
        });
    })
    return worldObjects;
}

function getProperty(properties, prop){
    let value = undefined
    if(!properties) return value;
    properties.forEach(function (property) {
        if(prop === property.name){
            value =  property.value;
        }
    })
    return value;
}


// move physics world into a seperate class after reducing coupling
class ItemWorld{
    constructor(sender, phyW) {
        this.sender = sender;
        this.floorItems = {};
        this.lastItemId = 0;
    }

    addItem(pos,item){
        let itemPos = this.lastItemId;
        let position = pos;
        //
         let newItem = {id:items.goldhelm.id,pos:position, quantity: 1, plus:5};//stubbed TODO: get this from the drop table
        //

        if(item){
            newItem = JSON.parse(JSON.stringify(item));//stubbed TODO: get this from the drop table
            newItem.pos = JSON.parse(JSON.stringify(pos));
        }

        this.floorItems[itemPos] = newItem;
        //let newItem = {id:items.seeradish.id,pos:position, quantity: 1};//stubbed TODO: get this from the drop table



        this.sender.notifyNewItem(itemPos, newItem);
        this.lastItemId++
    }

    removeItem(id){
        let item = this.floorItems[id];
        this.sender.notifyItemRemove(id);
        delete this.floorItems[id];
        return item;
    }

    canPickup(id,position){
        let item = this.floorItems[id];
        return item;
    }
}

// receive mapped map!
class Zone{
    constructor(zoneid) {
        this.zoneSender = new ZoneSender(zoneid);
        this.physicsWorld = new PhysicsWorld(zoneid, this.zoneSender);
        this.itemWorld = new ItemWorld(this.zoneSender,this.physicsWorld )
        this.zoneID = zoneid;

        systems.addToUpdate(this);
        this.testCreateMobLots(15);
    }

    testCreateMobLots(times){
        for(let i = 0; i < times; i++){
            this.physicsWorld.testCreateMob((pos)=>{this.itemWorld.addItem(pos)});
        }
    }

    join(clientID, playerLocation, previousZoneID, client, newPosition){
        if(previousZoneID != undefined){
            let previousZone = ZONES[previousZoneID];
            client = previousZone.leave(clientID);
            playerLocation.pos = Object.assign({}, newPosition);
        }
        this.zoneSender.subscribe(client);
        this.addPlayerCharacter(client, playerLocation);
    }

    leave(clientID){
        let client = this.zoneSender.room.clientLookup[clientID];
        this.zoneSender.notifyEntityRemove(client.player.config.key);
        this.zoneSender.unsubscribe(client);
        this.physicsWorld.removeEntity(client.player.config.key);
        return client;
    }

    pickup(client, id){

        let item = this.itemWorld.canPickup(id, client.player.pos);
        if(!item) return;

        let hasPickedUp =  client.playerInventory.addItem(item);
        // TODO: check pickup range serverrside (50)
        if(hasPickedUp){
            this.itemWorld.removeItem(id);
            client.emit("myInventory", {inventory:client.character.invent.inventory, paperDoll: client.character.invent.paperDoll})
            console.log(client.playerInventory);
        }
    }

    addPlayerCharacter(client, playerLocation){
        let newPlayer = this.physicsWorld.addPlayerCharacter(client, playerLocation.pos)
        client.playerLocation.zone = this.zoneID;
        client.player = newPlayer;

        this.zoneSender.notifyNewEntity(client, newPlayer);
        this.zoneSender.initMessage(client, this.physicsWorld.entities, this.itemWorld.floorItems, newPlayer.config.key);
    }

    update(){
        this.physicsWorld.update();
    }
}


class ZoneSender{
    constructor(zoneid) {
        this.room = roomManager.roomManager.createRoom();
        this.zoneID = zoneid;
    }

    removeItem(id) {
        this.room.roomMessage('removeItem', {id:id});
    }

    notifyNewItem(key,newItem){
        let nItem = {key:key, id:newItem.id, pos: newItem.pos, quantity:1}
        this.room.roomMessage('newItem', nItem);
    }

    subscribe(client){
        this.room.join(client);
        client.emit("loadMap", {id:this.zoneID});
    }

    unsubscribe(client){
        this.room.leave(client);
    }

    initMessage(client, enities, items) {
        client.emit("entityList", this.sendEntities(enities));
        client.emit("itemList", items);
        client.emit("myPlayer", {id: client.player.config.key});
        client.emit("myInventory", {inventory:client.character.invent.inventory,paperDoll: client.character.invent.paperDoll });
    }

    sendEntities(entites) {
        let tempEntities = {};
        let entityKeys = Object.keys(entites);
        entityKeys.forEach( (key)=> {

            let entity = entites[key];
            tempEntities[key] = {
                position:key,
                x:entity.pos.x,
                y:entity.pos.y,
                facing: entity.direction,
                state:entity.state,
                base: entity.animationComponent.baseSprite,
                layers: entity.animationComponent.spriteLayers,
                health: entity.health,
                mHealth: entity.maxHealth
            };
        });
        return tempEntities;
    }

    notifyNewEntity(client, entity){
        this.room.broadcastMessage(client,'newEntity', {
            id:entity.entityPos,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            base: entity.animationComponent.baseSprite,
            layers: entity.animationComponent.spriteLayers,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

    notifyEntityUpdate(entity, key){
        this.room.roomMessage('moveEntity', {
            id:entity.entityPos || key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

    notifyEntityRemove(entityPos){
        this.room.roomMessage('removeEntity', {
            id:entityPos
        })
    }

    notifyItemRemove(id){
        this.room.roomMessage('removeItem', {id:id})
    }

    notifyClientPlayer(client, entity, entityPos){
        client.emit('playerSpawn', {
            id:entityPos,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state
        })
    }

}
class PhysicsWorld{

    constructor(zoneid,  sender){
        this.sender = sender;
        this.collisionManager = new systems.CollisionManager();
        this.worldObjects = getWorldObjects(zoneid); // use this to target specfic zone
        this.createNonPassibles(this.worldObjects);
        this.entities = {};
        this.lastEntityId = 0;
    }

    update(){
        let entityKeys = Object.keys(this.entities);
        entityKeys.forEach( (key)=> {
            let entity = this.entities[key];

            if(entity.isDelete){
                this.removeEntity(key);
            }else{
                entity.update();
                this.sender.notifyEntityUpdate(entity, key); //temp
            }

        });
        this.collisionManager.update();
    }

    createNonPassibles(objects){
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

            }

        })

    }

    addPlayerCharacter(client){
        let entityKey = this.lastEntityId;
        let playerConfig = {
            appearance: client.character.appearance,
            paperDoll: client.character.invent.paperDoll,
            key: entityKey,
            stats: client.playerStats,
            location: client.playerLocation,
            _id: client.character._id
        }

        let newPlayer = new characters.ServerPlayer(playerConfig, this.collisionManager);
        this.entities[entityKey] = newPlayer;
        this.lastEntityId++
        return newPlayer;
    }

    testCreateMob(droptest){
        this.testMob = new characters.BasicMob(this.collisionManager,droptest);
        this.entities[this.lastEntityId] = this.testMob;
        this.lastEntityId++
    }

    removeEntity(id){
        let entity = this.entities[id];
        if(entity){
            this.sender.notifyEntityRemove(id);
            delete this.entities[id];
        }
    }

}


module.exports = {Zone};