const characterComponents = require('./character-components.js');


global.colliderTypes = {"PLAYER":"PLAYER","MONSTER":"MONSTER","NODE":"NODE","NONPASSIBLE":"NONPASSIBLE", "TRIGGER":"TRIGGER", "ZONETRIGGER":"ZONETRIGGER", "ATTACKSCAN":"ATTACKSCAN"};

messageTypes = {"DAMAGE":"DAMAGE", "REWARD":"REWARD"}





class GameObject{
    constructor(pos, zone) {
        this.components = [];
        this.isDelete = false;
        this.pos = pos;
        this.zone = zone;
    }
    update(){
        this.components.forEach(function (component) {
            component.update(this); // this should be done via pass by reference
        },this);
    }
    get x(){
        return this.pos.x;
    }
    get y(){
        return this.pos.y;
    }

    removeComponents(){
        this.components.forEach(function (component) {
            component.remove();
        },this);
    }
    //todo:
    message(message){
        return false;
    }
    collisionCallback(){}
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
class DamageableCharacter extends GameObject {
    constructor(pos, stats, zone) {
    super(pos, zone);
        this.stats = stats;
    }

    takeDamage(damage){
        let defence = this.stats.defence || 0;
        let damageTake = damage - defence;
        if(damageTake <= 0) damageTake = 1;
        this.health -= damageTake;
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

// ToDo: this shouldnt move
class BasicResource extends  DamageableCharacter{

    constructor(collisionManager, dropCallback, zone) {
        let layers = {base: "rock"};
        let pos = {x: 250, y: 250};
        let stats = { health: 100, maxHealth:100, defence:5};
        super(pos,  stats, zone);
        this.moveSpeed = 3;
        this.width = 32; // temp
        this.height = 32; // temp
        this.stats = stats ;
        this.dropCallback = dropCallback;
        this.createCollider(collisionManager);
        this.animationComponent = new characterComponents.AnimationComponent(layers, {x:0,y:0});
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
            message: (message)=>{
                this.message(message)
            },
            type: colliderTypes.NODE
        }
        let collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig)
        this.components.push(collider);
        return collider;
    }

    takeDamage(damage) {
        //this.dropCallback(this.pos);
        let drop = getDrop(0);
        let rewardMessage = {
            type: messageTypes.REWARD,
            items: [drop],
            experience: {mining: 30}
        }
        return rewardMessage;
        //return super.takeDamage(damage);
    }

    kill() {

    }

    message(message) {
        switch (message.type) {
            case messageTypes.REWARD:
                break;
            case messageTypes.DAMAGE:
                let reward = this.takeDamage(message.damage);
                message.rewardCB(reward);
                break;

        }
    }

}


class BasicMob extends  DamageableCharacter{

    constructor(collisionManager, deathCallback, zone) {
        let layers = {base: "pig"};
        let pos = {x: 150, y: 150};
        let stats = { health: 100, maxHealth:100, defence:5, attack:2 };
        super(pos, stats, zone);
        this.moveSpeed = 3;
        this.width = 32; // temp
        this.height = 32; // temp
        this.stats = stats ;
        this.deathCallback = deathCallback;
        this.createCollider(collisionManager);
        this.movementComponent = new characterComponents.MovementComponent(this.pos);
        this.animationComponent = new characterComponents.AnimationComponent(layers, this.movementComponent);
        this.components.push(new characterComponents.AIComponent(this.pos, this.velocity, this.movementComponent));
        this.components.push(this.movementComponent);
        this.components.push(this.animationComponent);

    }
    get direction(){
        return this.animationComponent.direction;
    }
    get state(){
        return this.animationComponent.currentState;
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
            message: (message)=>{
                this.message(message)
            },
            type: colliderTypes.MONSTER
        }
        let collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig)
        this.components.push(collider);
        return collider;
    }


    kill() {
        if(!this.isDelete){
            //

            this.deathCallback(this.pos);


            this.isDelete = true;
            this.removeComponents();
            // this.attackingComponent.remove();
            // this.attackingComponent = undefined;
            this.animationComponent.remove();
            this.animationComponent = undefined;
        }
    }
    sendDamageMessage(other){
        let message ={
            type: messageTypes.DAMAGE,
            damage: this.stats.attack
        }
        other.collisionCallback(message); //todo change to generic messaging functionality
    }


    message(message) {
        switch (message.type) {
            case messageTypes.DAMAGE:
                let reward = this.takeDamage(message.damage);
                let rewardMessage = {type:messageTypes.REWARD,
                    experience: {combat:reward}
                }
                message.rewardCB(rewardMessage);
                break;

        }
    }


    collisionCallback(other){
        switch(other.type){
            case colliderTypes.NONPASSIBLE:
                this.movementComponent.backStep();
                this.movementComponent.stop();
                break;
            case colliderTypes.PLAYER:
                this.sendDamageMessage(other);
                break;
        }
    }
}


class ServerPlayer extends DamageableCharacter{
    constructor(playerConfig, collisionManager){
        // let animLayers = {base:playerConfig.appearance}; // TODO: hair etc
        // let paperDoll = playerConfig.paperDoll;
        // let layers = [];
        //
        // let item = getGearSlot(paperDoll, "BOOTS")
        // if(item)layers.push({base:item.base.animString,effect: item.plus});
        //
        // item = getGearSlot(paperDoll, "LEGS")
        // if(item)layers.push({base:item.base.animString,effect: item.plus});
        //
        // item = getGearSlot(paperDoll, "BODY")
        // if(item)layers.push({base:item.base.animString,effect: item.plus});
        //
        // item = getGearSlot(paperDoll, "HEAD")
        // if(item)layers.push({base:item.base.animString,effect: item.plus});
        //
        // item = getGearSlot(paperDoll, "WEAPON")
        // if(item)layers.push({base:item.base.animString,effect: item.plus});
        //
        // item = getGearSlot(paperDoll, "OFFHAND")
        // if(item)layers.push({base:item.base.animString,effect: item.plus});
        //
        // animLayers.layers = layers;

        super(playerConfig.location.pos,  playerConfig.stats, playerConfig.location.zone);


        this.config = playerConfig;
        this.width = 32;
        this.height = 48;

        let collider = this.createCollider(collisionManager);
        this.movementComponent = new characterComponents.MovementComponent(this.pos);
        let animLayers = this.animationLayers;
        this.animationComponent = new characterComponents.AnimationComponent(animLayers, this.movementComponent);

        this.components.push(this.animationComponent);
        this.components.push(this.movementComponent);

        // may need stats to calculate damage etc
        this.attackingComponent = new characterComponents.AttackingComponent(collisionManager,
            this.pos,
            this.animationComponent,//wrong
            playerConfig.stats,
            this.zone
            );

    }

    modifyComponents(){
        this.animationComponent.spriteConfig = this.animationLayers;
    }

    get animationLayers(){
        let playerConfig = this.config;
        console.log("setting anim layers");
        let animLayers = {base:playerConfig.appearance};
        // TODO: hair etc
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
        return animLayers;
    }


    get direction(){
        return this.animationComponent.direction;
    }
    get state(){
        return this.animationComponent.currentState;
    }

    get entityPos(){
        return this.config.key;
    }


    reward(rewardMessage){

        if(rewardMessage.items){
            let itemReward = rewardMessage.items;
            itemReward.forEach((item)=>{
                this.config.inventory.pickupItem(item);
            })
        }
        if(rewardMessage.experience){

            this.config.stats.addExperience(rewardMessage.experience);

        }
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
            type: colliderTypes.PLAYER,
            message: (message)=>{
                this.message(message)
            },
            yOffset: 15
        }
        let collider = new characterComponents.ColliderComponent(collisionManager, colliderConfig)
        this.components.push(collider);
        return collider;
    }


    attack(){
        console.log(this.config.stats)
        let rewardCB = (rewardMessage)=>{this.message(rewardMessage);};
        let attackMessage = {
            type: messageTypes.DAMAGE,
            damage: this.config.stats.damage || 0,
            rewardCB: rewardCB
        }
        let attackCB = ()=>{this.attackingComponent.attack(attackMessage)};
        this.animationComponent.forceStateFor(400,180,states.THRUST, attackCB)
    }

    kill() {
        if(!this.isDelete){

            this.callback = setTimeout(() => {
                this.config.stats.health = this.config.stats.maxHealth;
                this.config.deathCallback();
                clearTimeout(this.callback);

            }, 2000)

            this.isDelete = true;
            this.removeComponents();
            this.attackingComponent.remove();
            this.attackingComponent = undefined;
            this.animationComponent.remove();
            this.animationComponent = undefined;
        }
    }

    collisionCallback(other){
        switch(other.type){
            case colliderTypes.NONPASSIBLE:
               this.movementComponent.backStep();
               break;
            case colliderTypes.PLAYER:
                break;
            case colliderTypes.TRIGGER:
            case messageTypes.DAMAGE: // todo move to an entity message method
                let damage = other.damage;
                this.takeDamage(damage)

                break;
            case colliderTypes.MONSTER:
                break;
            case colliderTypes.ZONETRIGGER:
                this.removeComponents();
                let zoneTarget = other.zoneTarget;
                let posTarget = other.posTarget;
                global.testZoneJoin(this.config._id, this.config.location, zoneTarget, posTarget);
                break;
            case colliderTypes.ATTACKSCAN:
                return this.takeDamage();
                break;
        }
    }

    message(message) {

        switch (message.type) {
            case messageTypes.REWARD:
                this.reward(message)
                break;
        }
    }
}

module.exports = {ServerPlayer, NonPassibleTerrain, ZonePortal, BasicMob, BasicResource}