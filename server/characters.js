directions = {"NORTH":"up", "WEST":"left", "SOUTH":"down", "EAST":"right" }
states  = {"THRUST":"thrust", "WALK":"walk","CAST":"cast", "STOP":"stop"}

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




class MovingGameObject{
    constructor(pos, animLayers) {
        this.velocity = {x: 0, y: 0};
        this.moveSpeed = 4;
        this.pos = pos;
        this.animationComponent = new AnimationComponent(animLayers);
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

function getGearSlot(paperdoll, key) {
    let gearSlot = paperdoll[key];
    return gearSlot;
}


class Player extends MovingGameObject{
    constructor(pos, playerConfig){
        let animLayers = {base:playerConfig.base};
        let paperDoll = playerConfig.paperDoll;
        let layers = [];
        let item = getGearSlot(paperDoll, "BOOTS")
        if(item)layers.push(item.animString);

        item = getGearSlot(paperDoll, "LEGS")
        if(item)layers.push(item.animString);

        item = getGearSlot(paperDoll, "BODY")
        if(item)layers.push(item.animString);

        item = getGearSlot(paperDoll, "HEAD")
        if(item)layers.push(item.animString);

        item = getGearSlot(paperDoll, "WEAPON")
        if(item)layers.push(item.animString);

        item = getGearSlot(paperDoll, "OFFHAND")
        if(item)layers.push(item.animString);

        animLayers.layers = layers;

        super(pos, animLayers);
    }

}

module.exports = {Player}