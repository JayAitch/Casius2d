directions = {"NORTH":"up", "WEST":"left", "SOUTH":"down", "EAST":"right" };
global.states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast", "STOP":"stop"};

class AnimationComponent{
    constructor(animLayers, moveComp) {
        this.currentState = states.STOP;
        this.facing = directions.NORTH;
        this.baseSprite = animLayers.base
        this.spriteLayers = animLayers.layers;
        this.moveComp = moveComp;
        this.deltaTime = 0;
        this.previouseVelo = moveComp.velocity;
        this.forcedState = false;
        this.direction = {x:-1,y:0};
    }

    remove(){
        this.isDelete = true;
        delete this;
    }

    set spriteConfig(val){
        this.baseSprite = val.base
        this.spriteLayers = val.layers;
    }

    forceStateFor(time, cbTime, state, callback){
        this.currentState = states.THRUST;
        if(!this.forcedState){
            this.forcedState = true;
            let cbTimeout = setTimeout(callback,cbTime);
            let stateTimeout = setTimeout(()=>{
                this.currentState = states.STOP;
                this.forcedState = false;
            },time);

        }

    }

    manageState(){
        let velocity = this.moveComp.velocity
        if(!this.forcedState && this.previouseVelo !== velocity){
            this.facing = velocity;
            if (velocity.x === 0 && velocity.y === 0) {
                this.currentState = states.STOP;
            } else {
                this.currentState = states.WALK;
            }
            this.previouseVelo = velocity;
        }
    }


    update(){
        this.manageState();
        this.deltaTime++;
    }

    set facing(val){

        if(val.x !== 0){
            if(val.x > 0){
                this.direction = directions.EAST;
            }
            else if(val.x < 0){
                this.direction = directions.WEST;
            }
        }
        else{
            if(val.y > 0){
                this.direction = directions.SOUTH;
            }
            else if(val.y < 0){
                this.direction = directions.NORTH;
            }
        }
    }
}

class AttackingComponent{
    constructor(collisionManager, origin, directionObject, stats, zoneid, layers){
        this.collisionManager = collisionManager;
        this.origin = origin;
        this.directionObject = directionObject;
        this.stats = stats;
        this.zoneid = zoneid;
        this.layers = layers;
    }

    scanForEntities(x,y,width,height){
        sendAOEDebug(this.zoneid,{x:x,y:y},width,height);
        return this.collisionManager.boxScan({x:x,y:y},width,height,this.layers);
    }

    attack(message){
        let direction = directionAsVector(this.directionObject.direction)|| {x: 0, y: -1};
        let x = (direction.x * 50) + this.origin.x;
        let y = (direction.y * 50) + this.origin.y;
        let hitEntities = this.scanForEntities(x,y,50,50);
        hitEntities.forEach((entities)=>{
            entities.message(message);
        })
    }


    remove(){
        this.isDelete = true;
        delete this;
    }
}

function directionAsVector(direction){
    switch (direction) {
        case "up":
            return {x:0,y:-1}
            break;
        case "left":
            return {x:-1,y:0}
            break;
        case "down":
            return {x:0,y:1}
            break;
        case "right":
            return {x:1,y:0}
            break;
    }
}



class ColliderComponent{
    constructor(collisionManager, colliderConfig) {
        this.collisionCallback = colliderConfig.callback;
        this.width = colliderConfig.width;
        this.height = colliderConfig.height;
        this.basePos = colliderConfig.pos;
        this.yOffset = colliderConfig.yOffset;
        this.type = colliderConfig.type;
        this.collisionRegistration = collisionManager.addCollider(colliderConfig.layer,this);
        this.interacts = colliderConfig.interacts;
        this.isDelete = false;
        this.message = colliderConfig.message;
    }

    get x(){
        return this.basePos.x;
    }
    get y(){
        let offset = this.yOffset || 0;
        return this.basePos.y + offset;
    }

    remove(){
        this.isDelete = true;
    }

    onCollision(otherObj){
        return this.collisionCallback(otherObj);
    }
    update(parent){
        this.basePos = parent.pos;//wrong
    }
}




class AIComponent{
    constructor(pos, velocity, movementComp, attackComp){
        this.tick = 0;
        this.pos = pos;
        this.velocity = velocity;
        this.firstAction = 10;
        this.movementComp = movementComp;
        this.attackComp = attackComp
    }
    remove(){delete this;}

    update(entity){
        this.tick++;
        switch (this.tick % this.firstAction) {
            case 0:
                this.changeDirection();
                let velocity = {
                    x: this.direction.x * 10,
                    y: this.direction.y * 10
                }
                this.movementComp.stop();
                this.movementComp.addMovement(velocity);
                this.aiAttack();
                break
            case 50:
                this.changeDirection();
                this.movementComp.stop();
                //this.attackComp.attack();

                break;
            default:
        }


    }
    remove(){
        this.isDelete = true;
        delete this;
    }

    aiAttack(){
        let attackMessage = {
            type: messageTypes.DAMAGE,
            damage: this.attackComp.stats.attack  || 0,
            rewardCB: function(){}
        }
        console.log(this.attackComp.stats.attack)
        this.attackComp.attack(attackMessage);
    }

    changeDirection(){
        // if(this.flip){
        //     this.flip =!this.flip;
        //     this.direction = {x:0,y:1};
        // }
        // else{
        //     this.flip =!this.flip;
        //     this.direction = {x:0,y:-1};
        // }
        let int = randomInteger(0,3);
        this.firstAction = randomInteger(10,50);
        switch (int) {
            case 0:
                this.direction = {x:0,y:1};
                break;
            case 1:
                this.direction = {x:0,y:-1};
                break;
            case 2:
                this.direction = {x:1,y:0};
                break;
            case 3:
                this.direction = {x:-1,y:0};
                break;
        }
    }
}



// not currently used
class MovementComponent{
    constructor(pos,speed) {
        this.velocity = {x: 0, y: 0};
        this.moveSpeed = speed;
        this.pos = pos;
        this.previousePos = pos;
    }

    stop(){
        this.velocity = {x:0,y:0};
    }

    move(){
        this.previousePos = this.pos;
        this.pos.x = this.previousePos.x + this.velocity.x;
        this.pos.y = this.previousePos.y + this.velocity.y;
    }

    backStep(){
        this.pos = this.previousePos;
        this.pos.x = this.previousePos.x - this.velocity.x;
        this.pos.y = this.previousePos.y - this.velocity.y;
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
    }

    update(){
        this.move();
    }

    remove(){
        this.isDelete = true;
        delete this;
    }
}

module.exports = {MovementComponent,ColliderComponent, AttackingComponent,AnimationComponent,AIComponent};