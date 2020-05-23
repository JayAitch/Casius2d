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

// receive mapped map!
class Zone{
    constructor(zoneid) {
        this.physicsWorld = new PhysicsWorld(zoneid, (id)=>{this.notifyEntityRemove(id)});//temp

        this.floorItems = {};
        this.room = roomManager.roomManager.createRoom();
        this.zoneID = zoneid;
        this.lastItemId = 0;


        systems.addToUpdate(this);
        this.physicsWorld.testCreateMob();
        this.addItem(150,150);

    }



    join(client, pos){
        this.room.join(client);
        client.zone = this; // might not need
        client.emit("loadMap", {id:this.zoneID});
        this.addPlayerCharacter(client, pos);
    }

    leave(client){
        this.notifyEntityRemove(client.player.entityPos);
        this.room.leave(client);
        this.physicsWorld.removeEntity(client.player.entityPos)
    }


    addPlayerCharacter(client, pos){
        let newPlayer = this.physicsWorld.addPlayerCharacter(client, pos)

        client.playerStats.zone = this.zoneID;
        client.player = newPlayer;

        this.notifyNewEntity(client, newPlayer, newPlayer.entityPos);
        client.emit("entityList", this.allEntities());
        client.emit("itemList", this.floorItems);
    }

    addItem(pos){
        let itemPos = this.lastItemId;

        let newItem = {id:0,pos:pos};
        this.floorItems[itemPos] = newItem;

        this.notifyNewItem(newItem);
        this.lastItemId++
    }


    removeItem(id) {
        this.room.roomMessage('removeItem', id);
    }

    notifyNewItem(newItem){
        this.room.roomMessage('newItem', newItem);
    }


// create sender class
    allEntities() {
        let tempEntities = {};
        let entityKeys = Object.keys(this.physicsWorld.entities);
        entityKeys.forEach( (key)=> {

            let entity = this.physicsWorld.entities[key];
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

    notifyNewEntity(client, entity, entityPos){
        this.room.broadcastMessage(client,'newEntity', {
            id:entityPos,
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

    notifyClientPlayer(client, entity, entityPos){
        client.emit('playerSpawn', {
            id:entityPos,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state
        })
    }

    update(){
        this.physicsWorld.update((entity, key)=>{this.notifyEntityUpdate(entity, key)});
    }
}

class PhysicsWorld{

    constructor(zoneid, removemessage){
        this.collisionManager = new systems.CollisionManager();
        this.worldObjects = getWorldObjects(zoneid); // use this to target specfic zone
        this.createNonPassibles(this.worldObjects);
        this.entities = {};
        this.lastEntityId = 0;
        this.removeMessage = removemessage;
    }

    update(message){
        let entityKeys = Object.keys(this.entities);
        entityKeys.forEach( (key)=> {
            let entity = this.entities[key];

            if(entity.isDelete){
                this.removeEntity(key);
            }else{
                entity.update();
                message(entity, key); //temp
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

    addPlayerCharacter(client, pos){
        let entityPos = this.lastEntityId;
        let newPos = JSON.parse(JSON.stringify(pos));
        // need to remove client
        let newPlayer = new characters.ServerPlayer(newPos, players[0], this.collisionManager, client, entityPos, client.playerStats);
        this.entities[entityPos] = newPlayer;
        this.lastEntityId++
        return newPlayer;
    }

    testCreateMob(){
        this.testMob = new characters.BasicMob(this.collisionManager);
        this.entities[this.lastEntityId] = this.testMob;
        this.lastEntityId++
    }

    removeEntity(id){
        let entity = this.entities[id];
        if(entity){
            this.removeMessage(id);
            delete this.entities[id];
        }
    }

}


module.exports = {Zone};