let anim = "nothing";

let slots = {"HEAD":"HEAD","BODY":"BODY","BELT":"BELT","LEGS":"LEGS", "1HWEAPON":"1HWEAPON", "2HWEAPON":"2HWEAPON", "OFFHAND":"OFFHAND"}
class Item {
    constructor(iconString, name, description){
        this.iconString = iconString;
        this.name = name;
        this.description = description;
    }
}
class EquiptableItem extends Item{
    constructor(iconString, name, description,animString, slot){
        super(iconString, name, description);
        this.animationString = animString;
        this.name = name;
        this.description = description;
        this.slot = slot
    }
}
let item = new EquiptableItem()
equiptableItems = [];
equiptableItems[0] = new EquiptableItem("goldhelm", "", "");
equiptableItems[1] = new EquiptableItem("goldlegs");
equiptableItems[2] = new EquiptableItem("leatherbelt");
equiptableItems[3] = new EquiptableItem("jacket");
equiptableItems[4] = new EquiptableItem("spear");
equiptableItems[5] = new EquiptableItem("shield");
equiptableItems[6] = new EquiptableItem("tspear");



class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
    }


    preload(){
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

        this.controller = new Controller(this,client);
    }

    newEntity(id, x, y, facing, state, base, layers){
        this.mapEntities[id] = new Player(this, {x:x,y:y}, facing, state, base, layers);
    }

    moveEntity(id, x, y, facing, state){
        let entity = this.mapEntities[id];
        if(entity){
            entity.newPosition = {x:x, y:y};
            entity.facing = facing;
            entity.state = state;
        }

    }

    playerSpawn(id, x, y, facing, state, base, layers){
        this.newEntity(id, x, y, facing, state, base, layers);
    }

    update(){
        Object.keys(this.mapEntities).forEach((key)=>{
            this.mapEntities[key].update()
        });
    }


}




class Controller{
    constructor(scene, client){
        let leftKey = scene.input.keyboard.addKey("LEFT");
        let rightKey = scene.input.keyboard.addKey("RIGHT");
        let upKey = scene.input.keyboard.addKey("UP");
        let downKey = scene.input.keyboard.addKey("DOWN");
        let spaceKey = scene.input.keyboard.addKey("SPACE");


        spaceKey.on('down', (event)=> {
           // console.log(scene.mapEntities);
            scene.mapEntities[0].animation = "walkup"
        });
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
