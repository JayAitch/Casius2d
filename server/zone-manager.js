const roomManager = require('./room-manager.js');
const systems = require('./systems.js');
const characters = require('./server-characters.js');
const fs = require('fs');
systems.startUpdate();



function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


function getZoneData(){
    let rawdata = fs.readFileSync('./tilemaps/zone1.json');
    let tilemap = JSON.parse(rawdata);
    return tilemap;
}

function getWorldObjects(){
    let worldData = getZoneData();
    let worldObjects = [];
    worldData.forEach(function(layer){
        console.log(layer);
        layer.objects.forEach(function(object){
            let newObject = {
                width:object.width,
                height:object.height,
                pos: {x: object.x,y:object.y}
            }
            worldObjects.push(newObject);
        });
    })
    return worldObjects;
}



// receive mapped map!
class Zone{
    constructor() {
        this.physicsWorld = new PhysicsWorld(800, 800);
        this.entities = [];
        this.room = roomManager.roomManager.createRoom();
        systems.addToUpdate(this);
        this.collisionManager = new systems.CollisionManager();
        this.worldObjects = getWorldObjects();
        this.createNonPassibles(this.worldObjects);


    }

    join(client){
        this.room.join(client);
        this.addPlayerCharacter(client);
    }

    addPlayerCharacter(client){
        let entityPos = this.entities.length;
        let newPlayer = new characters.Player({x:150,y:150}, players[0], this.collisionManager);
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
            let testNonPassible = new characters.NonPassibleTerrain(correctPos, object.width,object.height,this.collisionManager);
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