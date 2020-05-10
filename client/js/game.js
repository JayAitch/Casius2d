let anim = "nothing";

class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
    }


    preload(){
        this.load.image("tiles", "assets/tilesets/magecity.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/testmap.json");
        this.load.spritesheet('goldhelm', 'assets/character/armour/helm/golden_helm_male.png', {frameWidth:64,frameHeight:64});
        this.load.spritesheet('basecharacter', 'assets/character/body/tanned.png', {frameWidth:64,frameHeight:64});
    }


    create(){
        const client = new GameClient(this, "localhost", "55000");
        client.sender.connect();
        const map = this.make.tilemap({ key: "map" });

        // Parameters are the name you gave the tilesets in Tiled and then the key of the tilesets image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("magecity", "tiles");

        // Parameters: layer name (or index) from Tiled, tilesets, x, y
        const belowLayer = map.createStaticLayer("Ground Layer", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("Below player", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Above player", tileset, 0, 0);


       // this.player = new Player(this, {x:40,y:40});
        this.controller = new Controller(this,client);
        this.testAnimations();
    }
    testAnimations(){
        let animFramRate = 14;
        this.anims.create({
            key: 'castup',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 0, end: 6 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'castleft',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 13, end: 19 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'castdown',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 26, end: 32 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'castright',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 39, end: 45 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustup',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 52, end: 59 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustleft',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 65, end: 72 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustdown',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 78, end: 85 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustright',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 91, end: 98 }),
            frameRate: animFramRate,
            repeat: -1
        });
        //104 is standing
        this.anims.create({
            key: 'walkup',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 104, end: 112 }),
            frameRate: animFramRate,
            repeat: -1
        });

        this.anims.create({
            key: 'walkleft',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 117, end: 125 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walkdown',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 130, end: 138 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walkright',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 143, end: 151 }),
            frameRate: animFramRate,
            repeat: -1
        });







        this.anims.create({
            key: 'castuph',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 0, end: 6 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'castlefth',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 13, end: 19 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'castdownh',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 26, end: 32 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'castrighth',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 39, end: 45 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustuph',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 52, end: 59 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustlefth',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 65, end: 72 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustdownh',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 78, end: 85 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustrighth',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 91, end: 98 }),
            frameRate: animFramRate,
            repeat: -1
        });
        //104 is standing
        this.anims.create({
            key: 'walkuph',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 104, end: 112 }),
            frameRate: animFramRate,
            repeat: -1
        });

        this.anims.create({
            key: 'walklefth',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 117, end: 125 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walkdownh',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 130, end: 138 }),
            frameRate: animFramRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walkrighth',
            frames: this.anims.generateFrameNumbers('goldhelm', { start: 143, end: 151 }),
            frameRate: animFramRate,
            repeat: -1
        });

    }

    newEntity(id, x, y){
        this.mapEntities[id] = new Player(this, {x:x,y:y});
    }

    moveEntity(id, x, y){
        let entity = this.mapEntities[id];
        if(entity)
        entity.newPosition = {x:x, y:y};
    }

    playerSpawn(id, x, y){
        this.newEntity(id, x, y);
    }

    update(){
        Object.keys(this.mapEntities).forEach((key)=>{
            this.mapEntities[key].update()
        });
        //this.player.update();
    }


}



class MovingSprite{
    constructor(scene, pos, imageID){
        this.pos = pos;
        this.sprite = scene.add.sprite(pos.x, pos.y, imageID);
       // this.hsprite = scene.add.sprite(pos.x, pos.y, "goldhelm");
        this.newPosition = pos;
        this.lastAnim = "";

    }

    move(){
        this.testAnimWalk();
        // lerp
        this.pos.x = (this.pos.x * 0.8) + (this.newPosition.x * 0.2);
        this.pos.y = (this.pos.y * 0.8) + (this.newPosition.y * 0.2);
        this.sprite.x = this.pos.x;
        this.sprite.y = this.pos.y;
    //    this.hsprite.x = this.pos.x;
    //    this.hsprite.y = this.pos.y;
    }

    testAnimWalk(){
        let direction = {x:0,y:0};
        direction.x =  this.newPosition.x - this.pos.x;
        direction.y  =  this.newPosition.y - this.pos.y;

        let anim = "walkright";
        let hanim = "walkrighth";
        // not like this
        if(direction.x === 0){
         if(direction.y < 0){
                anim = "walkup";
                hanim= "walkuph";
            }

            else if(direction.y > 0){
                anim = "walkdown";
                hanim = "walkdownh";
            }
        }
        else{
            if(direction.x < 0){
                anim = "walkleft";
                hanim = "walklefth"
            }
            else if(direction.x > 0){
                anim = "walkright";
                hanim = "walkrighth";
            }
        }




        console.log(this.lastAnim === anim);
        if(this.lastAnim === anim){

        }
        else{
            this.sprite.anims.play(anim);
   //         this.hsprite.anims.play(hanim);
            this.lastAnim = anim;
            console.log(anim);
        }

    }
}





class Player extends MovingSprite{
    constructor(scene, pos){
        super(scene,pos, "walk");

    }

    update(){
       this.move();
    }
}



class Controller{
    constructor(scene, client){
        let leftKey = scene.input.keyboard.addKey("LEFT");
        let rightKey = scene.input.keyboard.addKey("RIGHT");
        let upKey = scene.input.keyboard.addKey("UP");
        let downKey = scene.input.keyboard.addKey("DOWN");

        this.client = client;

        leftKey.on('down', (event)=> {
            client.sender.move({x: -1, y:0});
        });

        leftKey.on('up', function(event) {
            client.sender.stop();
        });


        rightKey.on('down', (event)=> {
            client.sender.move({x:1, y:0});
        });

        rightKey.on('up', function(event) {
            client.sender.stop();
        });

        upKey.on('down', (event)=> {
            client.sender.move({x:0, y:-1});
        });

        upKey.on('up', function(event) {
            client.sender.stop();
        });

        downKey.on('down', (event)=> {
            client.sender.move({x:0, y:1});
        });
        downKey.on('up', function(event) {
            client.sender.stop();
        });
    }

}
