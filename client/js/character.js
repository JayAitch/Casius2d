class HealthBar {

    constructor (scene, x, y,width, height, max, value)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
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
        this.bar.clear();
        let border = 4;
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, this.width + border, this.height + border);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, this.width, this.height);

        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor((this.value/ this.maxValue) * this.width);

        this.bar.fillRect(this.x + 2, this.y + 2, d, this.height);
    }

}

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
        if(this.sprite.anims)
        this.sprite.anims.play(lookup);
    }

    destroy() {
        this.sprite.destroy();
        delete this;
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
    let currentTint = [255,255,255]
    scene.tweens.addCounter({
        from: 255,
        to: 111,
        duration: 2000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            currentTint[0] = value;
            sprite.setTint(Phaser.Display.Color.GetColor(currentTint[0], currentTint[1], currentTint[2]));
        }
    });

    scene.tweens.addCounter({
        from: 255,
        to: 111,
        duration: 1000,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            let value = Math.floor(tween.getValue());
            currentTint[1] = value;
        }
    });
}


function addSpriteEffect(sprite,scene,level){
    if(level === 6) sixPlusEffect(sprite,scene);
}

class MovingMultiSprite extends MovingSprite{

    constructor(scene, pos, base, layers){
        super(scene,pos, base);
        this.spriteList = {};
        layers.forEach((elem)=>{
            let sprite = scene.add.sprite(pos.x, pos.y);
            this.spriteList[elem.base] = sprite;
            addSpriteEffect(sprite,scene, elem.effect); //temp
        })

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
        })
    }
}
//"goldhelm", "goldlegs", "leatherbelt","jacket","dspear", "shield",

class TestMonster extends MovingSprite{
    constructor(scene, pos, base, health, mHealth){
        console.log(health);
        super(scene, pos, base);
        this.healthBar = new HealthBar(scene,pos.x,pos.y,100,12, health, mHealth)
    }
    set health(val){
        console.log("health update");
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
        this.healthBar.x = this.pos.x;
        this.healthBar.y = this.pos.y;
        this.healthBar.draw();
    }
}


class Player extends MovingMultiSprite{
    constructor(scene, pos, facing, state, base, layers, health, mHealth){
        super(scene, pos, base, layers);
        this.healthBar = new HealthBar(scene,pos.x,pos.y,100,12, health, mHealth)
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
