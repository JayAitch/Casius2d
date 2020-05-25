const characterComponents = require('./character-components.js');
directions = {"NORTH":"up", "WEST":"left", "SOUTH":"down", "EAST":"right" };
states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast", "STOP":"stop"};
global.colliderTypes = {"PLAYER":0,"MONSTER":1,"NONPASSIBLE":2, "TRIGGER":3, "ZONETRIGGER":4, "ATTACKSCAN":5};








class MovingGameObject{
    constructor(pos, animLayers) {
        this.velocity = {x: 0, y: 0};
        this.moveSpeed = 10;
        this.pos = pos;
        this.previousePos = pos;
        this.animationComponent = new characterComponents.AnimationComponent(animLayers);
        this.components = [];
        this.isAttacking = false;//temp
        this.attackingInc = 0//temp;
        this.isDelete = false;
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
        this.animationComponent.facing = this.velocity; //temp
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

    // temp method!!!! move to animation component
    tempAnimationStateManager(){

        let attackingCount = 10//temp when moved change to be based off delta time
        if(this.isAttacking){
            this.animationComponent.currentState = states.THRUST;
            this.attackingInc++;
            let callbackTime = this.attackCallBack.count;

            if(callbackTime == this.attackingInc){
                this.attackCallBack.callback();
            }
            if(attackingCount < this.attackingInc){
                this.attackingInc = 0;
                this.isAttacking = false;
            }
        }
        else {
            if(this.velocity.x === 0 && this.velocity.y === 0){
                this.animationComponent.currentState = states.STOP;
            }else{
                this.animationComponent.currentState = states.WALK;
            }
        }
    }

    setIsAttacking(callback){
        this.isAttacking = true;
        this.attackCallBack = callback;
    }


    update(){
        this.move();
        this.tempAnimationStateManager();
        this.components.forEach(function (component) {
            component.update(this); // this should be done via pass by reference
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
        this.collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig)
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
        this.collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig);
        this.collider.zoneTarget = zoneTarget;
        this.collider.posTarget = {x:x || 0, y:y  || 0};
    }

    collisionCallback(other){
    }
}


// make damaging character seperate from MGO
class DamageableCharacter extends MovingGameObject {
    constructor(pos, animLayers, stats) {
        super(pos, animLayers);
        this.stats = stats;
    }

    takeDamage(){
        this.health -= 30;
        if(this.health <= 0) this.kill();
        let reward = 30;
        return reward;
    }
    get health(){
        return this.stats.health;
    }
    set health(val){
        this.stats.health = val;
    }
    kill(){
        return;
    }
    get maxHealth(){
        return this.stats.maxHealth;
    }
}


class BasicMob extends  DamageableCharacter{

    constructor(collisionManager, test) {
        let layers = {base: "basecharacter"};
        let pos = {x: 150, y: 150};
        let stats = { health: 100, maxHealth:100 };

        super(pos, layers, stats);
        this.width = 32; // temp
        this.height = 32; // temp
        this.moveSpeed = 3;
        this.deathCallbackTest = test;
        this.createCollider(collisionManager);
        this.components.push(new characterComponents.AIComponent(this.pos, this.velocity));
        //this.addMovement({x:1,y:1})
    }

    createCollider(collisionManager){
        let colliderConfig = {
            width:this.width,
            height:
            this.height,
            pos: this.pos,
            layer:2,
            //  interacts:[0,1,3,4],
            interacts:[0],
            callback: (other)=>{
                return this.collisionCallback(other);
            },
            type: colliderTypes.MONSTER
        }
        let collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig)
        this.components.push(collider);
        return collider;
    }


    kill(){
        this.isDelete = true;
        this.deathCallbackTest(this.pos);
        this.removeComponents();
    }


    collisionCallback(other){
        switch(other.type){
            case colliderTypes.NONPASSIBLE:
                this.backStep();
                this.stop();
                break;
            case colliderTypes.ATTACKSCAN:
                return this.takeDamage();
                break;
        }
    }
}


class ServerPlayer extends DamageableCharacter{
    constructor(pos, playerConfig, collisionManager, client, entityPos, playerStats){
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

        super(pos, animLayers, playerStats);
        this.width = 32;
        this.height = 32;
        let collider = this.createCollider(collisionManager);
        // may need stats to calculate damage etc
        this.attackingComponent = new characterComponents.AttackingComponent(collisionManager,
            this.pos,
            this.animationComponent,//wrong
            collider.collisionRegistration, // wrong this may change
            playerStats
        );
        this.client = client; // remove??
        this.entityPos = entityPos; // remove
        this.playerStats = playerStats;
    }

    createCollider(collisionManager){
        let colliderConfig = {
            width:this.width,
            height: this.height,
            pos: this.pos,
            layer:1,
            interacts:[0,2,3,4],
            callback: (other)=>{
                return this.collisionCallback(other);
            },
            type: colliderTypes.PLAYER
        }
        let collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig)
        this.components.push(collider);
        return collider;
    }


    attack(){
        // temp move to attacking compont
        if(!this.isAttacking){
            this.setIsAttacking(
                {
                    count: 5,
                    callback:()=>{
                        let reward = this.attackingComponent.attack();
                        this.playerStats.experience += reward;
                    }
                });
        }
    }


    //temp
    move(){
        if(!this.isAttacking){
            super.move();
        }
    }
    kill() {
        // try change to is delete!!
        // global.killPlayer(this.client);
        this.isDelete = true;
        this.removeComponents();
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
            case colliderTypes.ATTACKSCAN:
                return this.takeDamage();
                break;
        }
    }

}

module.exports = {ServerPlayer, NonPassibleTerrain, ZonePortal, BasicMob}