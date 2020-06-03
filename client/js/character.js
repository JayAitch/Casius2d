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

// todo: generalise effects with custom shader
function plusEightEffect(sprite, scene){

    customPipeline = game.renderer.addPipeline('Custom', new CustomPipeline(game));

    sprite.setPipeline('Custom');

    return customPipeline;
    // scene.tweens.addCounter({
    //     from: 2,
    //     to: 0,
    //     duration: 2000,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         customPipeline.setFloat1('tim', tween.getValue());
    //         //console.log(tween.getValue());
    //         //customPipeline.setFloat2('uResolution', Phaser.Display.Color.GetColor(sprite.currentTint[0]),Phaser.Display.Color.GetColor(sprite.currentTint[1]));
    //
    //         let value = Math.floor(tween.getValue());
    //
    // //        sprite.setTint(Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]));
    //       //  sprite.setTintFill( 0xffffff,0xffffff,0xffffff,0xffffff)
    //     }
    // });
    // scene.tweens.addCounter({
    //     from: 255,
    //     to: 5000,
    //     duration: 50000,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         let value = Math.floor(tween.getValue());
    //         sprite.currentTint[1] = value;
    //     }
    // });
    // //
    // scene.tweens.addCounter({
    //     from: 255,
    //     to: 5000,
    //     duration: 100000,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         let value = Math.floor(tween.getValue());
    //         sprite.currentTint[0] = value;
    //     }
    // });

    // scene.tweens.addCounter({
    //     from: 255,
    //     to: 50,
    //     duration: 200,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         // sprite.tintTopLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
    //         // sprite.tintBottomLeft = Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]);
    //         // sprite.tintTopRight = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
    //         // sprite.tintBottomRight = Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]);
    //
    //
    //
    //         sprite.tintTopLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
    //         // sprite.tintBottomLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
    //         //  sprite.tintTopRight = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
    //         sprite.tintBottomRight = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
    //     }
    // });
    //
    // scene.tweens.addCounter({
    //     from: 255,
    //     to: 30,
    //     duration: 200,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         let value = Math.floor(tween.getValue());
    //         sprite.currentTint[0] = value;
    //
    //
    //     }
    // });
    //
    //
    // scene.tweens.addCounter({
    //     from: 30,
    //     to: 255,
    //     duration: 500,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         let value = Math.floor(tween.getValue());
    //         //   sprite.currentTint[1] = value;
    //     }
    // });
    //
    //
    // scene.tweens.addCounter({
    //     from: 255,
    //     to: 30,
    //     duration: 500,
    //     yoyo:true,
    //     repeat: -1,
    //     onUpdate: (tween)=>
    //     {
    //         let value = Math.floor(tween.getValue());
    //         sprite.currentTint[2] = value;
    //
    //     }
    // });





}
function sixPlusEffect(sprite, scene){
    scene.tweens.addCounter({
        from: 255,
        to: 50,
        duration: 200,
        yoyo:true,
        repeat: -1,
        onUpdate: (tween)=>
        {
            // sprite.tintTopLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
            // sprite.tintBottomLeft = Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]);
            // sprite.tintTopRight = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
            // sprite.tintBottomRight = Phaser.Display.Color.GetColor(sprite.currentTint[0], sprite.currentTint[1], sprite.currentTint[2]);



            sprite.tintTopLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
           // sprite.tintBottomLeft = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
           //  sprite.tintTopRight = Phaser.Display.Color.GetColor(sprite.currentTint[2], sprite.currentTint[1], sprite.currentTint[0]);
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
        this.time = 0;
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


    update(){
       // super.update();
        // TODO move shaders and stuff to an renderItem class
        if(this.testRender){
            this.testRender.setFloat1('time', this.time);
            this.time += 0.05
        }
    }


    set layers(val){
        let keyList = Object.keys(this.spriteList);
        keyList.forEach((key)=>{
            let sprite2 = this.spriteList[key];
            sprite2.destroy();
            delete this.spriteList[key];
        });

        val.forEach((elem)=>{
            let sprite = this.scene.add.sprite(this.pos.x, this.pos.y);;
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

    // playWalk(){
    //     let cb = ()=>{audioPlayer.playFootstep()}
    //     setInterval(cb, 300);
    // }

    update(){
        this.move();
        this.healthBar.x = this.pos.x;
        this.healthBar.y = this.pos.y;
        this.healthBar.draw();
        super.update();
    }
}

var CustomPipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

        function CustomPipeline (game)
        {
            Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
                game: game,
                renderer: game.renderer,
                fragShader:` 
                    precision lowp float;
                    varying vec2 outTexCoord;
                    varying vec4 vColor;
                    varying vec4 outTint;
                    uniform sampler2D uSampler;
                    uniform float time;



            vec4 plasma()
            {
                float freq = 0.08;
                float value =
                    sin(time + freq);
                     
                    //  +
                    // sin(time + freq) +
                    // sin(time + freq) +
                    // cos(time + freq * 2.0);

                return vec4(
                    cos(value) * 0.5,
                    sin(value)* 0.5,
                    sin(value * 3.14 * 2.0)* 0.5,
                    1
                );
            }
//
//             void main()
//             {
//                 vec4 texel = texture2D(uMainSampler, outTexCoord);
//                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                 gl_FragColor = texel * plasma();
//             }





                    void main() {
                        vec4 sum = vec4(0);
                        vec2 texcoord = outTexCoord;
                        for(int xx = -4; xx <= 4; xx++) {
                            for(int yy = -3; yy <= 3; yy++) {
                                float dist = sqrt(float(xx*xx) + float(yy*yy));
                                float factor = 0.0;
                                if (dist == 0.0) {
                                    factor = 2.0;
                                } else {
                                    factor = 2.0 / abs(float(dist));
                                }
                            sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;
                            }
                        }
                        
                        // float sinTime = abs(sin(time)); 
                        // vec4 texel = texture2D(uSampler, outTexCoord);
                        // texel *= vec4(outTint.rgb * outTint.a, outTint.a);
                        //
                        // gl_FragColor = texel + (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
                        //       
                        
                                  
                    vec4 texel = texture2D(uSampler, outTexCoord);
                    texel *= vec4(outTint.rgb * outTint.a, outTint.a);
                    texel *= plasma();
                    float sinTime = abs(sin(time));
                    gl_FragColor = texel + (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord) ;
                        
                   //     float sinTime = abs(sin(time));                      
                   //     gl_FragColor = (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord); 
                    }
                           
                 `
            });
        }


});


// `
//                     precision lowp float;
//                     varying vec2 outTexCoord;
//                     varying vec4 vColor;
//
//                     uniform sampler2D uSampler;
//                     uniform float time;
//
//                     void main() {
//                         vec4 sum = vec4(0);
//                         vec2 texcoord = outTexCoord;
//                         for(int xx = -4; xx <= 4; xx++) {
//                             for(int yy = -3; yy <= 3; yy++) {
//                                 float dist = sqrt(float(xx*xx) + float(yy*yy));
//                                 float factor = 0.0;
//                                 if (dist == 0.0) {
//                                     factor = 2.0;
//                                 } else {
//                                     factor = 2.0 / abs(float(dist));
//                                 }
//                             sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;
//                             }
//                         }
//                         float sinTime = abs(sin(time));
//                         gl_FragColor = (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
//                     }
//
//                  `





// var CustomPipeline = new Phaser.Class({
//
//     Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
//
//     initialize:
//
//         function CustomPipeline (game)
//         {
//             Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
//                 game: game,
//                 renderer: game.renderer,
//                 fragShader: `
//             precision mediump float;
//
//             uniform sampler2D uMainSampler;
//             uniform vec2 resolution;
//             uniform float uTime;
//
//             varying vec2 outTexCoord;
//             varying vec4 outTint;
//
//             vec4 plasma()
//             {
//                 vec2 pixelPos = vec2(gl_FragCoord.x/resolution.x,gl_FragCoord.y/resolution.y);
//                 float freq = 0.8;
//                 float value =
//                     sin(uTime + uTime *  freq) +
//                     sin(uTime + uTime *  freq) +
//                     sin(uTime + uTime *  freq) +
//                     cos(uTime + uTime * freq * 2.0);
//
//                 return vec4(
//                     cos(value),
//                     sin(value),
//                     sin(value * 3.14 * 2.0),
//                     1
//                 );
//             }
//
//             void main()
//             {
//                 vec4 texel = texture2D(uMainSampler, outTexCoord);
//                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                 gl_FragColor = texel * plasma();
//             }
//
//             `
//             });
//         }
//
//
// });






//
// var CustomPipeline = new Phaser.Class({
//
//     Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
//
//     initialize:
//
//         function CustomPipeline (game)
//         {
//             Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
//                 game: game,
//                 renderer: game.renderer,
//                 fragShader: `
//             precision mediump float;
//
//             uniform sampler2D uMainSampler;
//             uniform vec2 uResolution;
//             uniform float uTime;
//
//             varying vec2 outTexCoord;
//             varying vec4 outTint;
//
//             vec4 plasma()
//             {
//                 vec2 pixelPos = gl_FragCoord.xy / uResolution * 20.0;
//                 float freq = 0.8;
//                 float value =
//                     sin(uTime + pixelPos.x * freq) +
//                     sin(uTime + pixelPos.y * freq) +
//                     sin(uTime + (pixelPos.x + pixelPos.y) * freq) +
//                     cos(uTime + sqrt(length(pixelPos - 0.5)) * freq * 2.0);
//
//                 return vec4(
//                     cos(value),
//                     sin(value),
//                     sin(value * 3.14 * 2.0),
//                     cos(value)
//                 );
//             }
//
//             void main()
//             {
//                 vec4 texel = texture2D(uMainSampler, outTexCoord);
//                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                 gl_FragColor = texel * plasma();
//             }
//
//             `
//             });
//         }
//
//
// });