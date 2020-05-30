
class AnimationComponent{
    constructor(animLayers,attackingComponent) {
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
    constructor(collisionManager, origin, directionObject, stats, enemyLayers){
        this.collisionManager = collisionManager;
        this.origin = origin;
        this.directionObject = directionObject;
        this.stats = stats;
        this.enemyLayers = enemyLayers;
    }

    scanForEntities(x,y,width,height){
        return this.collisionManager.boxScan({x:x,y:y},width,height,this.enemyLayers);
    }

    attack(){
        let direction = directionAsVector(this.directionObject.direction);
        let x = (direction.x * 30) + this.origin.x;
        let y = (direction.y * 30) + this.origin.y;
        let hitEntities = this.scanForEntities(x,y,150,150);

        return this.damageAllEntities(hitEntities)
    }


    damageAllEntities(entities){
        let damageMessage = {type:colliderTypes.ATTACKSCAN};
        let reward = 0;
        entities.forEach((entity)=>{
            reward += entity.onCollision(damageMessage);
        })
        return reward;
    }

    scanInFront(width,height){
        // issue with rotation of scanning thing
        let direction = directionAsVector(this.directionObject.direction);
        let x = (direction.x * 30) + this.origin.x;
        let y = (direction.y * 30) + this.origin.y;
        let hitEntities = this.scanForEntities(x,y,width,height);
        return hitEntities;
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
    }
    // TODO: change to pas by reference
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
    constructor(pos, velocity, attackingComponent){
        this.tick = 0;
        this.pos = pos;
        this.velocity = velocity;
        this.firstAction = 10;
        this.attackingComponent = attackingComponent;
        this.attackRange = 50; //temp
        this.attackCooldown = 10;
    }

    remove(){delete this;};
    update(entity){
        this.tick++;

        if(this.target){
            if(this.target.isDelete) {
                this.target = undefined;
                entity.moveSpeed = 3 //temp
                return;
            }
            if(this.isInRange()){
                switch (this.tick % this.attackCooldown) {
                    case 0:
                    this.attackPlayer();
                }
            }
            else{
                let directionToTarget = this.getDirectionToTarget();
                let velocity = {
                    x: directionToTarget.x * 10,
                    y: directionToTarget.y * 10
                }
                switch (this.tick % 10) {
                    case 0:
                        entity.addMovement(velocity);
                }

            }

        }else{
            this.lookForPlayer();
            if(this.target){
                entity.moveSpeed = 8 //temp
            }
            switch (this.tick % this.firstAction) {
                case 0:
                    this.changeDirection();
                    let velocity = {
                        x: this.direction.x * 10,
                        y: this.direction.y * 10
                    }
                    entity.stop();
                    entity.addMovement(velocity);
                    break
                case 6:

                case 50:
                    this.changeDirection();
                    entity.stop();

                    break;
                default:

            }
        }

    }

    isInRange() {
        let targetPos = {
            x: this.target.x,
            y: this.target.y
        }
        let dist = distance(targetPos, this.pos);
        return (dist < this.attackRange);
    }

    getDirectionToTarget(){
        let direction = {
            x:this.target.x - this.pos.x,// strapValue(this.target.x - this.pos.x,1,-1),
            y:this.target.y - this.pos.y//  strapValue(this.target.y - this.pos.y,1,-1)
        }
        return direction;
    }
    attackPlayer(){

        this.attackingComponent.damageAllEntities([this.target]);
    }

    lookForPlayer(){
        //let hitEntites = this.attackingComponent.scanInFront(200,200);
        let hitEntites = this.attackingComponent.scanForEntities(this.pos.x, this.pos.y, 400,400)
        if(hitEntites.length > 0) {
            this.target = hitEntites[0];
            //TEMP

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