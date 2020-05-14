const PORT = 55000;
const systems = require('./systems.js');
const roomManager = require('./room-manager.js');
const server = require('http').createServer();




global.io = require('socket.io')(server);
io = global.io;




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
        client.emit("entityList", this.entities);
    }

    // notifyNewEntity(entity, entityPos){
    //     this.room.roomMessage('newEntity', {id:entityPos, x:entity.pos.x, y:entity.pos.y})
    // }

    notifyNewEntity(client, entity, entityPos){
        this.room.broadcastMessage(client,'newEntity', {id:entityPos, x:entity.pos.x, y:entity.pos.y, facing: entity.direction})
    }
    notifyEntityUpdate(entity, entityPos){
        this.room.roomMessage('moveEntity', {id:entityPos, x:entity.pos.x, y:entity.pos.y, facing: entity.direction, state:entity.currentState})
    }

    notifyClientPlayer(client, entity, entityPos){
        client.emit('playerSpawn', {id:entityPos, x:entity.pos.x, y:entity.pos.y, facing: entity.direction})
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
states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast"}

class MovingGameObject{
    constructor(pos){
        this.velocity = {x:0, y:0};
        this.moveSpeed = 4;
        this.pos = pos;
        this.direction = directions.NORTH;
        this.currentState = states.WALK;
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
        this.changeDirection();
    }


    changeDirection(){
        if(this.velocity.x !== 0){
            if(this.velocity.x > 0){
                this.direction = directions.EAST;
            }
            else{
                this.direction = directions.WEST;
            }
        }
        else{
            if(this.velocity.y > 0){
                this.direction = directions.SOUTH;
            }
            else{
                this.direction = directions.NORTH;
            }
        }
    }

    move(){
        this.pos.x = this.pos.x + this.velocity.x;
        this.pos.y = this.pos.y + this.velocity.y;
    }

    update(){
        this.move();
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

