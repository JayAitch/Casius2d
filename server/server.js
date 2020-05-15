const PORT = 55000;
const systems = require('./systems.js');
const roomManager = require('./room-manager.js');
const server = require('http').createServer();




global.io = require('socket.io')(server);
io = global.io;

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
    }

    join(client){
        this.room.join(client);
        this.addPlayerCharacter(client);

    }

    addPlayerCharacter(client){
        let entityPos = this.entities.length;
        let newPlayer = new Player({x:400,y:400});
        client.player = newPlayer;
        this.entities.push(newPlayer);
        this.notifyNewEntity(client, newPlayer, entityPos);
        client.emit("entityList", this.allEntities());
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
directions = {"NORTH":"up", "WEST":"left", "SOUTH":"down", "EAST":"right" }
states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast", "STOP":"stop"}


allGear = ["dspear", "goldhelm", "goldlegs", "leatherbelt", "jacket","dspear", "goldhelm", "goldlegs", "leatherbelt", "jacket"]
let compCount = 0;

class AnimationComponent{
    constructor() {
        this.currentState = states.STOP;
        this.facing = directions.NORTH;
        this.baseSprite = "basecharacter"
        if(compCount % 2){
            this.spriteLayers = ["spear", "goldhelm", "goldlegs", "leatherbelt", "shield"]
        }else{
            this.spriteLayers = ["spear", "jacket", "goldlegs", "leatherbelt"]
        }
       // this.spriteLayers = ["spear", "goldhelm", "goldlegs", "leatherbelt", "shield"]
        this.testDifferentGear();
        compCount++;
    }

    testDifferentGear(){
    //    this.spriteLayers.push(randomGear[randomInt(0, randomGear.length -1)]);
    }

    set facing(val){

        if(val.x !== 0){
            if(val.x > 0){
                this.direction = directions.EAST;
            }
            else{
                this.direction = directions.WEST;
            }
        }
        else{
            if(val.y > 0){
                this.direction = directions.SOUTH;
            }
            else{
                this.direction = directions.NORTH;
            }
        }
    }
}


// class MovementComponent{
//     constructor(pos) {
//         this.velocity = {x: 0, y: 0};
//         this.moveSpeed = 4;
//         this.pos = pos;
//     }
//     move(){
//         this.pos.x = this.pos.x + this.velocity.x;
//         this.pos.y = this.pos.y + this.velocity.y;
//     }
//     addMovement(addedVelocity){
//         let previouseVelocity = this.velocity;
//         let x = Math.sign(addedVelocity.x) + Math.sign(previouseVelocity.x);
//         let y = Math.sign(addedVelocity.y) + Math.sign(previouseVelocity.y);
//
//         if(Math.abs(x) > 0 && Math.abs(y) > 0){
//             let xSign = Math.sign(x);
//             let ySign = Math.sign(y);
//             let mX = x;
//             let mY = y;
//             x = Math.pow(0.8,(mX * mX) + (mY * mY)) * xSign;
//             y = Math.pow(0.8,(mX * mX) + (mY *mY)) * ySign;
//         }
//
//         this.velocity = {x: x * this.moveSpeed, y:  y * this.moveSpeed};
//     }
// }
//




class MovingGameObject{
    constructor(pos) {
        this.velocity = {x: 0, y: 0};
        this.moveSpeed = 4;
        this.pos = pos;
        this.animationComponent = new AnimationComponent();
        this.components = [];
    }

    addMovement(addedVelocity){
        let previouseVelocity = this.velocity;
        let x = Math.sign(addedVelocity.x) + Math.sign(previouseVelocity.x);
        let y = Math.sign(addedVelocity.y) + Math.sign(previouseVelocity.y);

        if(Math.abs(x) > 0 && Math.abs(y) > 0){
            let xSign = Math.sign(x);
            let ySign = Math.sign(y);
            let mX = x;
            let mY = y;
            x = Math.pow(0.8,(mX * mX) + (mY * mY)) * xSign;
            y = Math.pow(0.8,(mX * mX) + (mY *mY)) * ySign;
        }
        this.velocity = {x: x * this.moveSpeed, y:  y * this.moveSpeed};
        this.animationComponent.facing = this.velocity;
    }

    get direction(){
        return this.animationComponent.direction;
    }
    get state(){
        return this.animationComponent.currentState;
    }

    move(){
        this.pos.x = this.pos.x + this.velocity.x;
        this.pos.y = this.pos.y + this.velocity.y;
    }

    update(){
        this.move();
        if(this.velocity.x === 0 && this.velocity.y === 0){
            this.animationComponent.currentState = states.STOP;
        }else{
            this.animationComponent.currentState = states.WALK;
        }
        this.components.forEach(function (component) {
            component.update(this);

        },this);
    }



    stop(){
        this.velocity = {x:0,y:0};
    }
}


class Player extends MovingGameObject{
    constructor(pos){
        super(pos);
    }
}




systems.startUpdate();
let firstZone = new Zone();
io.on('connect', function(client) {
    firstZone.join(client);

    client.on('stop',function() {
        client.player.stop();
    });

    client.on('move',function(data) {
        client.player.addMovement({x:data.x, y:data.y});
    });

    client.on('disconnect', function(){
   //.     systems.removeFromUpdater(client.player.updaterID);
   //     client.player = undefined;
    });

});



server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

