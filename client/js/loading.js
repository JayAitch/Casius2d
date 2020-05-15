let animations = {};



class BootScene extends Phaser.Scene {
    constructor() {
        super({key: 'boot'});
    }

    preload() {
        // load all files necessary for the loading screen
        //  game assets will be loaded via parsing assets json
        this.load.json('assets', 'assets/assets.json');
        this.load.image('sky', 'assets/sky1.png');
    }

    create() {
        // trigger asset load from json
        this.scene.start('preload');
    }
}



// handles asset loading through json cached before starting this scene
class PreloadScene extends Phaser.Scene{

    constructor(){
        super({ key: 'preload' });

    }

    create(){
      //  Audio = new AudioPlayer();
        this.loadAnimations(this.cache.json.get('animations'));
    }

    preload ()
    {
        // start loading all assets defined in the json
        this.loadAssetFromJson(this.cache.json.get('assets'));

        // add background image to the page
        this.add.image(900, 600, 'sky');

        // show the player the loading state
        this.createProgressbar();

    }





    // create a progress bar in the center of the screen and append complete and progress update listeners
    createProgressbar(){


        // fully loaded size of the progress bar
        let width = 500;
        let height = 50;

        // position the bar in the center of the screen
        let xStartpos = gameCenterX() - width / 2;
        let yStartPos = gameCenterY() - height /2;

        // create the rectangle
        let borderRect = new Phaser.Geom.Rectangle(
            xStartpos,
            yStartPos,
            width,
            height,
        );

        // !!! look this up what is action inside this typwise
        let progressbar = this.add.graphics();


        // create a function to update the progress bar
        let updateProgressbar = function(percentComplete)
        {
            progressbar.clear();
            progressbar.fillStyle(0xeeeeee, 1);
            progressbar.fillRect(xStartpos, yStartPos, percentComplete * width, height);

        };

        // append listener to loader API to trigger update to bar
        this.load.on('progress', updateProgressbar);

        this.load.once('complete', function ()
        {
            //todo: move and test this at the end of on create
            this.scene.start('maingame');
        }, this);
    }


    // cache all assets referenced in the JSON
    loadAssetFromJson(json){
        // start looking for objects from the top of the json
        Object.keys(json).forEach( function(group)
        {

            // go through any array found there
            Object.keys(json[group]).forEach(function (key){

                // save the value of the current element
                let value = json[group][key];
                // route different load methods based on group in the json
                // this will be different for each asset type
                // now we can store any property we want against the asset location
                switch(group) {
                    case 'json':
                        this.load[group](key,value);

                    case 'image':
                        this.load[group](key, value);
                        break;

                    case 'audio':
                        this.load[group](key, value);
                        break;

                    case 'spritesheet':
                        this.load[group](key, value.path,value.options);
                        break;

                    case 'tilemapTiledJSON':
                        this.load[group](key, value);
                        break;
                    case 'html':
                        this.load[group](key, value);
                        break;
                    default:

                }

            }, this);
        }, this);

    }


    // currently unused, this is how animations would be used
    // see assets/animation.json for an example of how the data format would look
    loadAnimations(json){

        // go through the json
        Object.keys(json).forEach( function(objectKey) {
            let animGroup = {};

            Object.keys(json[objectKey]).forEach(function (typeKey) {

                let animation = json[objectKey][typeKey];
                let animLookup = new AnimationLookup(typeKey, objectKey);
                animGroup[typeKey] = animLookup.lookup;
                if (animation.frames.frame || animation.frames.frame === 0) {

                    // yes - load the animation from the json data
                   this.anims.create({
                        key: animLookup.lookup,
                        frames: [animation.frames],
                        frameRate: animation.frameRate,
                    });

                } else {

                    // multi frame animation - create
                    let anim =this.anims.create({
                        key: animLookup.lookup,
                        frames: this.anims.generateFrameNumbers(animation.frames.key, animation.frames),
                        frameRate: animation.frameRate,
                        repeat: animation.repeat
                    });
                }
            }, this);

            animations[objectKey] = animGroup;
        }, this)
    }
}

class AnimationLookup{
    constructor(type, key) {
        this.key = key;
        this.type = type;
        this.lookup = key + type;
    }

}
function gameCenterX ()
{
    return game.config.width / 2;
}
function gameCenterY ()
{
    return game.config.height / 2;
}