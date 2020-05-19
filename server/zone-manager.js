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
        this.entities = [];
        this.room = roomManager.roomManager.createRoom();
        this.zoneID = zoneid;
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
        this.entities.splice(client.player.entityPos, 1);
        console.log(this.entities);
    }


    addPlayerCharacter(client, pos){
        let entityPos = this.entities.length;
        console.log(pos);
        let newPos = JSON.parse(JSON.stringify(pos))
        let newPlayer = new characters.Player(newPos, players[0], this.collisionManager, client, entityPos);
        client.player = newPlayer;
        this.entities.push(newPlayer);

        this.notifyNewEntity(client, newPlayer, entityPos);
        client.emit("entityList", this.allEntities());

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
        this.entities.forEach(function (entity) {
            tempEntities.push({
                x:entity.pos.x,
                y:entity.pos.y,
                facing: entity.direction,
                state:entity.state,
                base: entity.animationComponent.baseSprite,
                layers: entity.animationComponent.spriteLayers
            })
        })
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
            layers: entity.animationComponent.spriteLayers
        })
    }

    notifyEntityUpdate(entity, entityPos){
        this.room.roomMessage('moveEntity', {
            id:entityPos,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state
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

        for(let i = 0; this.entities.length > i; i++){
            let entitiy = this.entities[i];
            entitiy.update();
            this.notifyEntityUpdate(entitiy, i);
        }
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