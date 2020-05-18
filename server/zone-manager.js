const roomManager = require('./room-manager.js');
const systems = require('./systems.js');
const characters = require('./server-characters.js');
systems.startUpdate();



function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}




// receive mapped map!
class Zone{
    constructor() {
        this.physicsWorld = new PhysicsWorld(800, 800);
        this.entities = [];
        this.room = roomManager.roomManager.createRoom();
        systems.addToUpdate(this);
        this.collisionManager = new systems.CollisionManager();
    }

    join(client){
        this.room.join(client);
        this.addPlayerCharacter(client);

    }

    addPlayerCharacter(client){
        let entityPos = this.entities.length;
        let newPlayer = new characters.Player({x:400,y:400}, players[0]);
        client.player = newPlayer;
        this.testCollisons(newPlayer);

        this.entities.push(newPlayer);

        this.notifyNewEntity(client, newPlayer, entityPos);
        client.emit("entityList", this.allEntities());

    }

    testCollisons(nEnity){
        let collisionCount = 0;
        this.entities.forEach((entity)=>{
            console.log("addded colliion foir");
            this.collisionManager.addCollision(entity,nEnity, function(obj){
                collisionCount++
            //    entity.backStep();
            //    nEnity.backStep();
                console.log("collsioin " + collisionCount);
            })
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
    // notifyNewEntity(entity, entityPos){
    //     this.room.roomMessage('newEntity', {id:entityPos, x:entity.pos.x, y:entity.pos.y})
    // }

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

        this.collisionManager.update();
        for(let i = 0; this.entities.length > i; i++){
            let entitiy = this.entities[i];
            entitiy.update();
            this.notifyEntityUpdate(entitiy, i);
        }

    }
}

class PhysicsWorld{
    constructor(width,height){
        this.width = 800;
        this.height = 800;
    }
}


module.exports = {Zone};