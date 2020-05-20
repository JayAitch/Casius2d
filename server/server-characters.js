directions = {"NORTH":"up", "WEST":"left", "SOUTH":"down", "EAST":"right" };
states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast", "STOP":"stop"};
colliderTypes = {"PLAYER":0,"NONPASSIBLE":1, "TRIGGER":2, "ZONETRIGGER":3, "ATTACKSCAN":4};


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


class AttackingComponent{
    constructor(collisionManager, origin, directionObject, colReg){
        this.collisionManager = collisionManager;
        this.origin = origin;
        this.directionObject = directionObject;
        this.collisionRegistry = colReg;
    }

    scanForEntities(x,y,width,height){
        return this.collisionManager.boxScan({x:x,y:y},width,height,[1],this.collisionRegistry);
    }

    attack(){
        let direction = directionAsVector(this.directionObject.direction);
        let x = (direction.x * 30) + this.origin.x;
        let y = (direction.y * 30) + this.origin.y;
        let hitEntities = this.scanForEntities(x,y,150,150);
        let damageMessage = {type:colliderTypes.ATTACKSCAN};
        hitEntities.forEach((entities)=>{
            entities.onCollision(damageMessage);
        })


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
        this.remove = ()=>{
            collisionManager.removeCollider(this.collisionRegistration);
            console.log(collisionManager.layers[this.collisionRegistration.layer][this.collisionRegistration.position]);
        }
    }

    get x(){
        return this.pos.x;
    }
    get y(){
        return this.pos.y;
    }
    onCollision(otherObj){
        this.collisionCallback(otherObj);
    }
    update(parent){
        this.pos = parent.pos;
    }
}


class MovingGameObject{
    constructor(pos, animLayers) {
        this.velocity = {x: 0, y: 0};
        this.moveSpeed = 4;
        this.pos = pos;
        this.previousePos = pos;
        this.animationComponent = new AnimationComponent(animLayers);
        this.components = [];
    }

    get x(){
        return this.pos.x;
    }
    get y(){
        return this.pos.y;
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
        this.previousePos = this.pos;
        this.pos.x = this.previousePos.x + this.velocity.x;
        this.pos.y = this.previousePos.y + this.velocity.y;
    }

    update(){

        this.move();
   //     console.log(this.pos);
        if(this.velocity.x === 0 && this.velocity.y === 0){
            this.animationComponent.currentState = states.STOP;
        }else{
            this.animationComponent.currentState = states.WALK;
        }

        this.components.forEach(function (component) {
            component.update(this);
        },this);
    }

    removeComponents(){
        this.components.forEach(function (component) {
            component.remove();
        },this);
    }
    backStep(){
        this.pos = this.previousePos;
        this.pos.x = this.previousePos.x - this.velocity.x;
        this.pos.y = this.previousePos.y - this.velocity.y;
    }

    stop(){
        this.velocity = {x:0,y:0};
    }
}

function getGearSlot(paperdoll, key) {
    let gearSlot = paperdoll[key];
    return gearSlot;
}



class NonPassibleTerrain{
    constructor(pos, width, height, collisionManager) {
        let colliderConfig = {
            width:width,
            height: height,
            pos: pos,
            layer:0,
            callback: this.collisionCallback,
            type: colliderTypes.NONPASSIBLE
        }
        this.collider = new ColliderComponent(collisionManager, colliderConfig)
    }

    collisionCallback(other){
    }
}

// this needs to be ona  different layer
class ZonePortal{
    constructor(pos, width, height, collisionManager, zoneTarget, x, y) {
        let colliderConfig = {
            width:width,
            height: height,
            pos: pos,
            layer:0,
            callback: this.collisionCallback,
            type: colliderTypes.ZONETRIGGER
        }
        this.collider = new ColliderComponent(collisionManager, colliderConfig);
        this.collider.zoneTarget = zoneTarget;
        this.collider.posTarget = {x:x || 0, y:y  || 0};
    }

    collisionCallback(other){
    }
}

class DamageableCharacter extends MovingGameObject {
    constructor(pos, animLayers) {
    super(pos, animLayers);
        this.maxHealth = 100;
        this.health = this.maxHealth;
    }

    takeDamage(){
        this.health -= 30;
        console.log(this.health);
    }
}

class ServerPlayer extends DamageableCharacter{
    constructor(pos, playerConfig, collisionManager, client, entityPos){
        let animLayers = {base:playerConfig.base};
        let paperDoll = playerConfig.paperDoll;
        let layers = [];

        let item = getGearSlot(paperDoll, "BOOTS")
        if(item)layers.push({base:item.base.animString,effect: item.plus});

        item = getGearSlot(paperDoll, "LEGS")
        if(item)layers.push({base:item.base.animString,effect: item.plus});

        item = getGearSlot(paperDoll, "BODY")
        if(item)layers.push({base:item.base.animString,effect: item.plus});

        item = getGearSlot(paperDoll, "HEAD")
        if(item)layers.push({base:item.base.animString,effect: item.plus});

        item = getGearSlot(paperDoll, "WEAPON")
        if(item)layers.push({base:item.base.animString,effect: item.plus});

        item = getGearSlot(paperDoll, "OFFHAND")
        if(item)layers.push({base:item.base.animString,effect: item.plus});

        animLayers.layers = layers;

        super(pos, animLayers);
        this.width = 32;
        this.height = 32;
        let collider = this.createCollider(collisionManager);
        this.attackingComponent = new AttackingComponent(collisionManager,this.pos, this.animationComponent, collider.collisionRegistration);
        this.client = client;
        this.entityPos = entityPos;
    }

    createCollider(collisionManager){
        let colliderConfig = {
            width:this.width,
            height: this.height,
            pos: this.pos,
            layer:1,
            interacts:[0,2,3,4],
            callback: (other)=>{
                this.collisionCallback(other);
            },
            type: colliderTypes.PLAYER
        }
        let collider = new ColliderComponent(collisionManager, colliderConfig)
        this.components.push(collider);
        return collider;
    }
    attack(){
        this.attackingComponent.attack();
    }


    collisionCallback(other){
        switch(other.type){
            case colliderTypes.NONPASSIBLE:
               this.backStep();
               break;
            case colliderTypes.PLAYER:
                break;
            case colliderTypes.TRIGGER:
                break;
            case colliderTypes.ZONETRIGGER:
                    this.removeComponents();
                    let zoneTarget = other.zoneTarget;
                    let posTarget = other.posTarget;
                    global.testZoneJoin(this.client,"", zoneTarget, posTarget);
            case colliderTypes.ATTACKSCAN:
                    this.takeDamage();
                break;
        }
    }

}

module.exports = {Player: ServerPlayer, NonPassibleTerrain, ZonePortal}