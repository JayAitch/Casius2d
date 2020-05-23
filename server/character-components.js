
class AnimationComponent{
    constructor(animLayers) {
        this.currentState = states.STOP;
        this.facing = directions.NORTH;
        this.baseSprite = animLayers.base
        this.spriteLayers = animLayers.layers;
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

class AttackingComponent{
    constructor(collisionManager, origin, directionObject, stats){
        this.collisionManager = collisionManager;
        this.origin = origin;
        this.directionObject = directionObject;
        this.stats = stats;
    }

    scanForEntities(x,y,width,height){
        return this.collisionManager.boxScan({x:x,y:y},width,height,[2]);
    }

    attack(){
        let direction = directionAsVector(this.directionObject.direction);
        let x = (direction.x * 30) + this.origin.x;
        let y = (direction.y * 30) + this.origin.y;
        let hitEntities = this.scanForEntities(x,y,150,150);
        let damageMessage = {type:colliderTypes.ATTACKSCAN};
        let reward = 0;
        hitEntities.forEach((entities)=>{
            reward += entities.onCollision(damageMessage);
        })
        return reward;
    }

}


class ColliderComponent{
    constructor(collisionManager, colliderConfig) {
        this.collisionCallback = colliderConfig.callback;
        this.width = colliderConfig.width;
        this.height = colliderConfig.height;
        this.pos = colliderConfig.pos;
        this.type = colliderConfig.type;
        this.collisionRegistration = collisionManager.addCollider(colliderConfig.layer,this);
        this.interacts = colliderConfig.interacts;
        this.isDelete = false;
        // this.remove = ()=>{
        //     collisionManager.removeCollider(this.collisionRegistration);
        // }
    }

    get x(){
        return this.pos.x;
    }
    get y(){
        return this.pos.y;
    }

    remove(){
        this.isDelete = true;
    }

    onCollision(otherObj){
        return this.collisionCallback(otherObj);
    }
    update(parent){
        this.pos = parent.pos;//wrong
    }
}

class AIComponent{
    constructor(pos, velocity){
        this.tick = 0;
        this.pos = pos;
        this.velocity = velocity;
        this.firstAction = 100;
    }
    update(entity){
        this.tick++;
        switch (this.tick % this.firstAction) {
            case 0:
                this.changeDirection();
                let velocity = {
                    x: this.direction.x * 10,
                    y: this.direction.y * 10
                }
                entity.addMovement(velocity);
                break
            case 50:
                this.changeDirection();
                entity.stop();
                break;
            default:
        }
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
        this.firstAction = randomInteger(50,300);
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
    constructor(pos) {
        this.velocity = {x: 0, y: 0};
        this.moveSpeed = 4;
        this.pos = pos;
    }
    move(){
        this.pos.x = this.pos.x + this.velocity.x;
        this.pos.y = this.pos.y + this.velocity.y;
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
}

module.exports = {MovementComponent,ColliderComponent, AttackingComponent,AnimationComponent,AIComponent};