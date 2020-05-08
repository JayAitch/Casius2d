

class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
    }


    preload(){
        this.load.image("tiles", "assets/tilesets/buch-outdoor.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/testmap.json");
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
        this.sprite = scene.add.image(pos.x, pos.y, imageID);
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
        super(scene,pos, "player");
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
