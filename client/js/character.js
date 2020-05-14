

class MovingSprite{
    constructor(scene, pos, animationLookup){
        this.pos = pos;
        this.sprite = scene.add.sprite(pos.x, pos.y, animationLookup);
        this.newPosition = pos;
        this.lastAnim = "";
        this.animationLookup = animationLookup;
        this.facing = "up"
        this.state = "walk" // move all this to animation handler
    }

    move(){
        this.testAnimWalk();
        // lerp
        this.pos.x = (this.pos.x * 0.8) + (this.newPosition.x * 0.2);
        this.pos.y = (this.pos.y * 0.8) + (this.newPosition.y * 0.2);
        this.setPosition(this.pos.x, this.pos.y);

    }

    setPosition(x, y){
            this.sprite.x = x;
            this.sprite.y = y;
    }

    set animation(animKey){
        let lookup = animations[this.animationLookup][animKey];
        this.sprite.anims.play(lookup);
    }

    testAnimWalk(){
        let direction = {x:0,y:0};
        direction.x =  this.newPosition.x - this.pos.x;
        direction.y  =  this.newPosition.y - this.pos.y;
        let animPrefix = this.state;

        let anim = animPrefix + this.facing;



        if(this.lastAnim === anim){

        }
        else{
            this.animation = anim
            this.lastAnim = anim;
        }

    }
}


class MovingMultiSprite extends MovingSprite{

    constructor(scene, pos, base, array){
        super(scene,pos, base);
        this.spriteList = {};
        array.forEach((elem)=>{
            let sprite = scene.add.sprite(pos.x, pos.y);
            this.spriteList[elem] = sprite
        })
    }

    set animation(animKey){
        super.animation = animKey;
        let keyList = Object.keys(this.spriteList);

        keyList.forEach((key)=>{
            let sprite = this.spriteList[key];
            sprite.anims.play(key + animKey);
        })
    }


    setPosition(x, y){
        super.setPosition(x,y);
        let keyList = Object.keys(this.spriteList);
        keyList.forEach((key)=>{
            let sprite = this.spriteList[key];
            sprite.x = x;
            sprite.y = y;
        })
    }
}
//"goldhelm", "goldlegs", "leatherbelt","jacket","dspear", "shield",

class Player extends MovingMultiSprite{
    constructor(scene, pos){
        super(scene,pos, "basecharacter", ["dspear","goldhelm", "goldlegs", "leatherbelt","jacket"]);
    }

    update(){
       this.move();
    }
}
