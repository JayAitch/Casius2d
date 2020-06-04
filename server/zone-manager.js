const roomManager = require('./room-manager.js');
const systems = require('./systems.js');
const characters = require('./server-characters.js'); //temp
const gameObjects = require('./game-object-factory.js');
const fs = require('fs');
const dropManager = require('./drop-manager.js');
systems.startUpdate();




function getZoneData(zone){
    let file = ZONEMAPS[zone];
    let rawdata = fs.readFileSync('./tilemaps/'+ file);
    let tilemap = JSON.parse(rawdata);
    return tilemap;
}


ZONEMAPS= {0:"zone1.json",1:"zone2.json", 2:"zone3.json"}

SPAWNS= {0:{x:150,y:150},1:{x:400,y:400}, 2:{x:600,y:400}} //temp


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
            ////// TEMP /////
            let newzone = getProperty(object.properties, "zone");
            if(newzone !== undefined) newObject.zone = newzone;

            let xpos = getProperty(object.properties, "x");
            if(xpos !== undefined) newObject.x = xpos;

            let ypos = getProperty(object.properties, "y");
            if(ypos !== undefined) newObject.y = ypos;

            let id = getProperty(object.properties, "node_id");
            if(id !== undefined) newObject.node_id = id;


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
        let newItem = {base:items.goldhelm, pos:position, quantity: 1, plus:5};//stubbed TODO: get this from the drop table

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
        if(item){
            let itemDistance = distance(item.pos, position);
            if(itemDistance < 50) return item;

        }

    }
}


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





// receive mapped map!
class Zone{
    constructor(zoneid) {
        this.zoneSender = new ZoneSender(zoneid);
        this.physicsWorld = new PhysicsWorld(zoneid, this.zoneSender);
        this.itemWorld = new ItemWorld(this.zoneSender,this.physicsWorld);
        this.zoneID = zoneid;
        this.factory = new gameObjects.Factory(this.physicsWorld.collisionManager, this.itemWorld);
        systems.addToUpdate(this);
        this.testCreateMobLots(5);
      //  this.testCreateNodeLots(5);
    }
// todo: move to mob factor, promote more stats/ai configuration
//       spawn from zones added to map use A*
    testCreateMobLots(times){
        for(let i = 0; i < times; i++){


            let callBack = (pos)=>{
                this.itemWorld.addItem(pos,dropManager.roleDrop(0));
                let timedcallback = setTimeout(() => {
                    this.testCreateMobLots(1);
                    clearTimeout(timedcallback);
                }, 2000);
            }

            let config = {
                deathCallback: callBack,
                stats:{health: 100, maxHealth:100, defence:0, attack:2, speed:3 },
                zone: this.zoneID
            }

            let entityConfig = {
                type: gameObjects.entityTypes.pig.id,
                config: config
            }


            let newMob = this.factory.new(entityConfig);
            this.physicsWorld.addNewMob(newMob);
        }
    }

    triggerEntityReload(key){
       let entity = this.physicsWorld.entities[key];
       this.zoneSender.notifyEntityReload(entity, key);
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

        let hasPickedUp =  client.character.invent.pickupItem(item);
        if(hasPickedUp){
            this.itemWorld.removeItem(id);
            client.emit("myInventory",client.character.invent.message);
        }
    }

    addPlayerCharacter(client){

        // respawn player with max health at zone spawn when they die
        // TODO: add a global respawn point in town or something
        let deathCallback  = () =>{
            client.playerLocation.pos = Object.assign({}, SPAWNS[this.zoneID]);
            this.addPlayerCharacter(client);
        };

        let playerConfig = {
            inventory: client.character.invent,
            appearance: client.character.appearance,
            paperDoll: client.character.invent.paperDoll,
            key: client.character._id,
            stats: client.playerStats,
            location: client.playerLocation,
            _id: client.character._id,
            deathCallback: deathCallback //temp
        }


        let entityConfig = {
            type: gameObjects.entityTypes.player.id,
            config:playerConfig
        }

        let newPlayer = this.factory.new(entityConfig);


        this.physicsWorld.addPlayerCharacter(newPlayer, client.character._id)
        client.playerLocation.zone = this.zoneID;
        client.player = newPlayer;

        this.zoneSender.notifyClientPlayer(client, newPlayer);
        this.zoneSender.initMessage(client, this.physicsWorld.entities, this.itemWorld.floorItems, newPlayer.key);
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
        this.room.roomMessage('newItem', {key:key,item:newItem});
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
        client.emit("myPlayer", {id: client.player.key});
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
                layers: entity.animationComponent.spriteLayers ,
                health: entity.health,
                mHealth: entity.maxHealth
            };
        });

        return tempEntities;
    }

    notifyNewEntity(entity, key){
        this.room.roomMessage('newEntity', {
            id:key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            base: entity.animationComponent.baseSprite ,
            layers: entity.animationComponent.spriteLayers,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

    notifyEntityUpdate(entity, key){
        this.room.roomMessage('moveEntity', {
            id: key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

    notifyEntityReload(entity, key){
        this.room.roomMessage('reloadEntity', {
            id: key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            base: entity.animationComponent.baseSprite ,
            layers: entity.animationComponent.spriteLayers,
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

    notifyClientPlayer(client, entity){
        this.room.broadcastMessage(client,'newEntity', {
            id:entity.key,
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

}






class PhysicsWorld{

    constructor(zoneid,  sender){
        this.sender = sender;
        this.collisionManager = new systems.CollisionManager();
        this.worldObjects = getWorldObjects(zoneid); // use this to target specfic zone
        this.zoneid = zoneid;
        this.entities = {};
        this.lastEntityId = 0;
        this.createFromJSON(this.worldObjects);

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

                    let config = {
                        layers: {base: "rock"},
                        stats: { health: 100, maxHealth:100, defence:5},
                        pos:correctPos,
                        drop:lookup.drop,
                        zone: this.zoneid,
                        reward: lookup.reward
                    }
                    let objClass = lookup.class;

                    let testNode = new objClass(this.collisionManager,config);
                    this.entities[this.lastEntityId] = testNode;
                    this.lastEntityId++;
            }

        })

    }

    addPlayerCharacter(entity, key){
        this.entities[key] = entity;
        return entity;
    }

    addNewMob(mob){
        this.entities[this.lastEntityId] = mob;
        this.sender.notifyNewEntity(mob, this.lastEntityId);
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