const roomManager = require('./room-manager.js');
const systems = require('./systems.js');
const characters = require('./server-characters.js');
const fs = require('fs');
systems.startUpdate();



function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


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




// receive mapped map!
class Zone{
    constructor(zoneid) {
        this.physicsWorld = new PhysicsWorld(800, 800);
        this.entities = {};
        this.room = roomManager.roomManager.createRoom();
        this.zoneID = zoneid;
        this.lastEntityId = 0;
        systems.addToUpdate(this);
        this.collisionManager = new systems.CollisionManager();
        this.worldObjects = getWorldObjects(zoneid); // use this to target specfic zone
        this.createNonPassibles(this.worldObjects);
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
        delete this.entities[client.player.entityPos, 1];
    }

    killEntity(id){
        let entity = this.entities[id];
        if(entity){
            this.notifyEntityRemove(id);
            delete this.entities[id];
        }
    }

    addPlayerCharacter(client, pos){
        let entityPos = this.lastEntityId;

        let newPos = JSON.parse(JSON.stringify(pos))
        let newPlayer = new characters.Player(newPos, players[0], this.collisionManager, client, entityPos, client.playerStats);
        client.playerStats.zone = this.zoneID;
        client.player = newPlayer;

        this.entities[entityPos] = newPlayer;

        this.notifyNewEntity(client, newPlayer, entityPos);
        client.emit("entityList", this.allEntities());
        this.lastEntityId++
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

    allEntities() {
        let tempEntities = [];
        let entityKeys = Object.keys(this.entities);
        entityKeys.forEach( (key)=> {

            let entity = this.entities[key];
            tempEntities.push({
                position:entity.entityPos,
                x:entity.pos.x,
                y:entity.pos.y,
                facing: entity.direction,
                state:entity.state,
                base: entity.animationComponent.baseSprite,
                layers: entity.animationComponent.spriteLayers,
                health: entity.health,
                mHealth: entity.maxHealth
            })
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

    notifyEntityUpdate(entity){
        this.room.roomMessage('moveEntity', {
            id:entity.entityPos,
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
        let entityKeys = Object.keys(this.entities);
        entityKeys.forEach( (key)=> {
            let entity = this.entities[key];
            entity.update();
            this.notifyEntityUpdate(entity);
        });
        this.collisionManager.update();
    }
}

class PhysicsWorld{
    constructor(width,height){
        this.width = 800;
        this.height = 800;
    }
}


module.exports = {Zone};