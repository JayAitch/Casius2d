class HealthBar {

    constructor (scene, x, y,width, height, max, value, yOffset)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.depth = UILayer;
        this.yOffset = yOffset
        this.x = x - width/2;
        this.y = y;
        this.value = value;
        this.maxValue = max;
        this.width = width;
        this.height = height;

        this.draw();
        scene.add.existing(this.bar);

    }


    destroy(){
        this.bar.destroy();

    }

    decrease (amount)
    {
        this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    set health(val){
        this.value = val;
        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

    }

    set maxHealth(val){
        this.maxValue = val;
        this.draw();

    }

    draw ()
    {
        if(this.value === this.maxValue){
            this.bar.alpha = 0;
            return;
        }
        this.bar.alpha = 0.3;
        this.bar.clear();
        let border = 4;
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x  - this.width/2, this.y + this.yOffset, this.width + border, this.height + border);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2 - this.width/2, this.y + 2 + this.yOffset, this.width, this.height);

        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor((this.value/ this.maxValue) * this.width);

        this.bar.fillRect(this.x + 2 - this.width/2, this.y + 2 + this.yOffset, d, this.height);
    }

}

class MovingSprite{
    constructor(scene, pos, animationLookup){
        this.pos = pos;
        this.sprite = scene.add.sprite(pos.x, pos.y, animationLookup);
        this.sprite.depth = tempCharacterLayer;
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
        this.sprite.depth = tempCharacterLayer + y;
    }

    set animation(animKey){
        let anim = animations[this.animationLookup];
        let lookup = "nothing" //temp
        if(anim)
            lookup = animations[this.animationLookup][animKey];
        if(this.sprite.anims && lookup)
            this.sprite.anims.play(lookup);
    }

    destroy() {
        this.sprite.destroy();
        // delete this;
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
    changeAnimations(){
        let animPrefix = this.state;
        let anim = animPrefix + this.facing;
        this.animation = anim
        this.lastAnim = anim;
    }

    get x(){
        return this.sprite.x;
    }
    get y(){
        return this.sprite.y;
    }
}

// todo: generalise effects with custom shader

function threePlusEffect(sprite, scene){
    scene.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 3000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            sprite.tintTopLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
            sprite.tintBottomRight = Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]);
        }
    });


    scene.tweens.addCounter({
        from: 200,
        to: 140,
        duration: 2000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            sprite.currentTint[1] = value;
        }
    });
}

// todo: generalise effects with custom shader

function fourPlusEffect(sprite, scene){
    scene.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 3000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            sprite.setTint(Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]));
        }
    });
    scene.tweens.addCounter({
        from: 255,
        to: 60,
        duration: 1000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            sprite.currentTint[1] = value;
        }
    });
}


function plusEightEffect(sprite, scene){
    sprite.setPipeline('Custom');
}
// todo: generalise effects with custom shader
function sixPlusEffect(sprite, scene){
    scene.tweens.addCounter({
        from: 255,
        to: 50,
        duration: 200,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            sprite.tintTopLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
            sprite.tintBottomRight = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
        }
    });

    scene.tweens.addCounter({
        from: 255,
        to: 30,
        duration: 200,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            sprite.currentTint[0] = value;


        }
    });


    scene.tweens.addCounter({
        from: 30,
        to: 255,
        duration: 500,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
         //   sprite.currentTint[1] = value;
        }
    });


    scene.tweens.addCounter({
        from: 255,
        to: 30,
        duration: 500,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            sprite.currentTint[2] = value;

        }
    });
}


function addSpriteEffect(sprite,scene,level){
    sprite.currentTint = [255,255,255]
    if(level >= 2 && level <= 3) threePlusEffect(sprite,scene);
    if(level >= 4 && level <= 5) fourPlusEffect(sprite,scene);
    if(level >= 6 && level <= 7) return sixPlusEffect(sprite,scene);
    if(level >= 8)  return plusEightEffect(sprite,scene);
}



class MovingMultiSprite extends MovingSprite{

    constructor(scene, pos, base, layers){
        super(scene,pos, base);
        this.spriteList = {};
        layers.forEach((elem)=>{
            let sprite = scene.add.sprite(pos.x, pos.y);
            this.spriteList[elem.base] = sprite;
            sprite.z = tempCharacterLayer +1;
            this.testRender = addSpriteEffect(sprite,scene, elem.effect); //temp
        })
        this.scene = scene;
        this.tick = 0;
        this.changeAnimations();
    }

    set animation(animKey){
        super.animation = animKey;
        let keyList = Object.keys(this.spriteList);
        keyList.forEach((key)=>{
            let sprite = this.spriteList[key];
            if(sprite.anims)
                sprite.anims.play(key + animKey);
        })
    }





    set layers(val){
        let keyList = Object.keys(this.spriteList);
        keyList.forEach((key)=>{
            let sprite2 = this.spriteList[key];
            sprite2.destroy();
            delete this.spriteList[key];
        });

        val.forEach((elem)=>{
            let sprite = this.scene.add.sprite(this.pos.x, this.pos.y);
            this.spriteList[elem.base] = sprite;
            sprite.z = tempCharacterLayer +2;
            addSpriteEffect(sprite,this.scene, elem.effect); //temp
        })

        this.changeAnimations();
    }

    set base(val){
       // console.log(val);
    }




    destroy(){
        super.destroy();
        let keyList = Object.keys(this.spriteList);
        keyList.forEach((key)=>{
            let sprite = this.spriteList[key];
            sprite.destroy();
        });
    }

    setPosition(x, y){
        super.setPosition(x,y);
        let keyList = Object.keys(this.spriteList);
        keyList.forEach((key)=>{
            let sprite = this.spriteList[key];
            sprite.x = x;
            sprite.y = y;
            sprite.depth = tempCharacterLayer + y;

        })
    }
}
//"goldhelm", "goldlegs", "leatherbelt","jacket","dspear", "shield",

class TestMonster extends MovingSprite{
    constructor(scene, pos, base, health, mHealth){
        super(scene, pos, base);
        this.healthBar = new HealthBar(scene,pos.x,pos.y,60,8, health, mHealth,-30);
        this.prevHealth = health || -100; //temp
    }

    set health(val){
        if(this.prevHealth > val) {
            audioPlayer.mobPain.play();
            this.prevHealth = val;
        }
        this.healthBar.health = val;
    }

    set maxHealth(val){
        this.healthBar.maxHealth = val;
    }
    destroy() {
        super.destroy();
        this.healthBar.destroy();
    }


    update(){
        this.move();
        this.healthBar.x = this.pos.x;
        this.healthBar.y = this.pos.y;
        this.healthBar.draw();
    }
}


class Player extends MovingMultiSprite{
    constructor(scene, pos, facing, state, base, layers, health, mHealth){
        super(scene, pos, base, layers);
        this.healthBar = new HealthBar(scene,pos.x,pos.y,60,8, health, mHealth ,- 30)
    }
    set health(val){
        this.healthBar.health = val;
    }

    set maxHealth(val){
        this.healthBar.maxHealth = val;
    }
    destroy() {
        super.destroy();
        this.healthBar.destroy();
    }

    update(){
        this.move();
        this.healthBar.x = this.pos.x;
        this.healthBar.y = this.pos.y;
        this.healthBar.draw();
    }
}
class Bank{
    constructor(scene, pos) {
        this.sprite = scene.add.image(pos.x, pos.y, "basecharacter");//temp
        this.scene = scene;
    }
    get pos(){
        return {x: this.sprite.x,y: this.sprite.y }
    }
    get y(){
        return this.pos.y;
    }
    get x(){
        return this.pos.x;

    }
    get interactText(){
        return `press E to use bank`
    }

}

class WorkBench{
   constructor(pos, type, scene, recipes) {
       this.sprite = scene.add.image(pos.x, pos.y, type);//temp
       this.type = type;
       this.recipes = recipes
       this.scene = scene;

   }
   get pos(){
       return {x: this.sprite.x,y: this.sprite.y }
   }
   get y(){
       return this.pos.y;
   }
    get x(){
        return this.pos.x;

    }
    get interactText(){
       return `press E to use ${this.type}`
    }

}

class InteractDisplay{
    constructor(scene, text) {
        this.scene = scene;
        this.text = text;
    }

    countdownVisibility(){
        this.countingDown = true;
        this.time = setTimeout(()=>{this.countingDown = false}, 200);
    }

    showInteract(pos){
        // leaving here because we could be abusing th tween engine too much
       if(!this.countingDown){
           clearTimeout(this.time);
           this.countdownVisibility();

            let fftext = this.scene.add.text(pos.x, pos.y - 50, this.text); // todo change to key image
            fftext.setDepth(UILayer + 999);
            offsetByWidth(fftext);
            var tween = this.scene.tweens.add({
                targets: fftext,
                alpha: { from: 0.5, to: 1 },

                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 500,
                repeat: 0,            // -1: infinity
                yoyo: false
            });

            var tween = this.scene.tweens.add({
                targets: fftext,
                alpha: { from: 1, to: 0 },

                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 1000,
                repeat: 0,            // -1: infinity
                yoyo: false
            });
        }
   }

}