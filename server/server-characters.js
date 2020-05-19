directions = {"NORTH":"up", "WEST":"left", "SOUTH":"down", "EAST":"right" }
states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast", "STOP":"stop"}
colliderTypes = {"PLAYER":0,"NONPASSIBLE":1, "TRIGGER":2, "ZONETRIGGER":3};
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



class ColliderComponent{
    constructor(collisionManager, colliderConfig) {
        this.collisionCallback = colliderConfig.callback;
        this.width = colliderConfig.width;
        this.height = colliderConfig.height;
        this.pos = colliderConfig.pos;
        this.type = colliderConfig.type;
        this.collisionRegistration = collisionManager.addCollider(colliderConfig.layer,this);
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



class ServerPlayer extends MovingGameObject{
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
        this.createCollider(collisionManager);
        this.client = client;
        this.entityPos = entityPos;
    }

    createCollider(collisionManager){
        let colliderConfig = {
            width:this.width,
            height: this.height,
            pos: this.pos,
            layer:0,
            callback: (other)=>{
                this.collisionCallback(other);
            },
            type: colliderTypes.PLAYER
        }
        this.components.push(new ColliderComponent(collisionManager, colliderConfig));
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

                break;
        }
    }

}

module.exports = {Player: ServerPlayer, NonPassibleTerrain, ZonePortal}