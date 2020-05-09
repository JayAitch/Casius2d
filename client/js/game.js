let anim = "nothing";

class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
    }


    preload(){
        this.load.image("tiles", "assets/tilesets/buch-outdoor.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/testmap.json");
        this.load.spritesheet('basecharacter', 'assets/basetoon.png', {frameWidth:64,frameHeight:64});
    }


    create(){
        const client = new GameClient(this, "localhost", "55000");
        client.sender.connect();
        const map = this.make.tilemap({ key: "map" });

        // Parameters are the name you gave the tilesets in Tiled and then the key of the tilesets image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("buch-outdoor", "tiles");

        // Parameters: layer name (or index) from Tiled, tilesets, x, y
        const belowLayer = map.createStaticLayer("base", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("paths", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("top", tileset, 0, 0);


       // this.player = new Player(this, {x:40,y:40});
        this.controller = new Controller(this,client);
        this.testAnimations();
    }
    testAnimations(){
        this.anims.create({
            key: 'castup',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 0, end: 6 }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'castleft',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 13, end: 19 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'castdown',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 26, end: 32 }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'castright',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 39, end: 45 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustup',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 52, end: 59 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustleft',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 65, end: 72 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustdown',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 78, end: 85 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'thrustright',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 91, end: 98 }),
            frameRate: 10,
            repeat: -1
        });
        //104 is standing
        this.anims.create({
            key: 'walkup',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 104, end: 112 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkleft',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 117, end: 125 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walkdown',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 130, end: 138 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walkright',
            frames: this.anims.generateFrameNumbers('basecharacter', { start: 143, end: 151 }),
            frameRate: 10,
            repeat: -1
        });
        anim = "walkright"
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
        this.newPosition = pos;
    }

    move(){
        // lerp
        this.pos.x = (this.pos.x * 0.8) + (this.newPosition.x * 0.2);
        this.pos.y = (this.pos.y * 0.8) + (this.newPosition.y * 0.2);
        this.sprite.x = this.pos.x;
        this.sprite.y = this.pos.y;
    }
    stop(){
        this.velocity = {x:0,y:0};
    }
}





class Player extends MovingSprite{
    constructor(scene, pos){
        super(scene,pos, "walk");
        this.sprite.anims.play(anim);

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
