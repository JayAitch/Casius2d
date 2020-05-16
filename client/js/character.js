

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

function sixPlusEffect(sprite, scene){
    let previouseTint
    scene.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 2000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            sprite.setTint(Phaser.Display.Color.GetColor(255, value, 255));
        }
    });

    scene.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 1000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            sprite.setTint(Phaser.Display.Color.GetColor(255, 255, value));
        }
    });
}


function addItemEffect(sprite,scene,level){
    if(level === 6) sixPlusEffect(sprite,scene);
}

class MovingMultiSprite extends MovingSprite{

    constructor(scene, pos, base, array){
        super(scene,pos, base);
        this.spriteList = {};
        array.forEach((elem)=>{
            let sprite = scene.add.sprite(pos.x, pos.y);
            this.spriteList[elem.base] = sprite;
            addItemEffect(sprite,scene, elem.plus); //temp
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
    constructor(scene, pos, facing, state, base, layers){

        // do this serverside
        // let spriteLayers = [];
        // layers.forEach((itemid)=>{
        //     let newLayer = items[itemid].animString;
        //     spriteLayers.push(newLayer);
        // })
        super(scene, pos, base, layers);
        let update =  (tween) =>{

            let value = Math.floor(tween.getValue());
            image.setTint(Phaser.Display.Color.GetColor(value, value, value));
        }







        // var tween = scene.tweens.add({
        //     targets: this.sprite,
        //     alpha: { from: 0, to: 1 },
        //     // alpha: { start: 0, to: 1 },
        //     // alpha: 1,
        //     // alpha: '+=1',
        //     // onUpdate: (tween) =>
        //     // {
        //     //     var value = Math.floor(tween.getValue());
        //     //     this.sprite.setTint(Phaser.Display.Color.GetColor(value, value, value));
        //     // },
        //     paused:false,
        //     ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        //     duration: 1000,
        //     repeat: -1,            // -1: infinity
        //     yoyo: true
        // });
      //  tween.start();
    }

    update(){
       this.move();
    }
}
