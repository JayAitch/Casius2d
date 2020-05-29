let anim = "nothing";

//let slots = {"HEAD":"HEAD","BODY":"BODY","BELT":"BELT","LEGS":"LEGS", "1HWEAPON":"1HWEAPON", "2HWEAPON":"2HWEAPON", "OFFHAND":"OFFHAND"}

let slots = {"HEAD":"HEAD","BODY":"BODY","BELT":"BELT","LEGS":"LEGS", "BOOT":"BOOT", "WEAPON":"WEAPON", "OFFHAND":"OFFHAND"}
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



let items;
let MAPS = {0:"map",1:"map2"}
class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
        this.floorItems = {};
    }


    preload(){
    }

    init(data){
        this.client = new GameClient(this, data.socket);
        this.client.sender.connect();
        this.client.sender.joinZone(0);
    }

    loadPlayerData(id){
        this.playerID = id;
        let myPlayer = this.mapEntities[this.playerID];
        console.log(myPlayer)

        this.cameras.main.zoomTo(1.2,0);
        this.cameras.main.startFollow(myPlayer.sprite);

        // set background color, so the sky is not black
        this.cameras.main.setBackgroundColor('#ccccff');


    }

    create(){
        this.scene.launch("paperdoll", this.client.sender);
        this.scene.launch("inventory", this.client.sender);
        items = this.cache.json.get('items');
        this.controller = new Controller(this,this.client);
    }


    loadMap(id) {
        this.clearEnities();
        let key = MAPS[id];
        const map = this.make.tilemap({key: key});
        const tileset = map.addTilesetImage("magecity", "tiles");
        const belowLayer = map.createStaticLayer("Ground Layer", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("Below player", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Above player", tileset, 0, 0);
        aboveLayer.depth = tempAboveTileLayer;
    }

    getClosestItem(){
        let pickupRange = 50;
        let itemkeys = Object.keys(this.floorItems);
        let myPlayer = this.mapEntities[this.playerID];
        let itemKey = undefined
        itemkeys.forEach((key)=>{
            let item = this.floorItems[key]
            let distance = Phaser.Math.Distance.Between(item.x,item.y,myPlayer.pos.x,myPlayer.pos.y);
            // soft check, this is also done serverside
            if(distance < pickupRange){
                itemKey = key;
            }
        })
        return itemKey;
    }


    newItem(i,item,pos){
        let floorItem = this.add.sprite(pos.x, pos.y, item.id)
        floorItem.depth = itemLayer;
        this.floorItems[i] = floorItem;
    }

    removeItem(id){
        let floorItem = this.floorItems[id];
        floorItem.destroy();
        delete this.floorItems[id];
    }


// change to json!!
    newEntity(id, x, y, facing, state, base, layers, health, mHealth){
        if(layers) {
            this.mapEntities[id] = new Player(this, {x: x, y: y}, facing, state, base, layers, health, mHealth);
        }
        else{
            this.mapEntities[id] = new TestMonster(this, {x: x, y: y}, base,health,mHealth);
        }
    }

    clearEnities() {
        let entityKeys = Object.keys(this.mapEntities);
        entityKeys.forEach( (entity)=> {
            let mEntity = this.mapEntities[entity];
            mEntity.destroy();
        })
        this.mapEntities = {};
    }

    moveEntity(id, x, y, facing, state, health, mHealth){
        let entity = this.mapEntities[id];
        if(entity){
            entity.newPosition = {x:x, y:y};
            entity.facing = facing;
            entity.state = state;
            entity.health = health;
            entity.maxHealth = mHealth;
        }
    }


    removeEntity(id){
        let entity = this.mapEntities[id];
        if(entity) {
            entity.destroy();
            // this.mapEntities.splice(id, 1);
            delete this.mapEntities[id];
        }
    }

    playerSpawn(id, x, y, facing, state, base, layers, health, mHealth){
        this.newEntity(id, x, y, facing, state, base, layers, health, mHealth);
    }

    update(){
        Object.keys(this.mapEntities).forEach((key)=>{
            this.mapEntities[key].update()
        });
    }

    loadInventory(items){
        let inv = this.scene.get("inventory")
        inv.items = items.inventory;
        let pD = this.scene.get("paperdoll")
        pD.items = items.paperDoll;
    }

}




class Controller{
    constructor(scene, client){
        let leftKey = scene.input.keyboard.addKey("LEFT");
        let rightKey = scene.input.keyboard.addKey("RIGHT");
        let upKey = scene.input.keyboard.addKey("UP");
        let downKey = scene.input.keyboard.addKey("DOWN");
        //    let spaceKey = scene.input.keyboard.addKey("SPACE");
        let spaceKey = scene.input.keyboard.addKey("SPACE");
        let ctrlKey = scene.input.keyboard.addKey("CTRL");

        this.client = client;

        ctrlKey.on('down', (event)=> {
            let itemID = scene.getClosestItem();
            if(itemID)
                client.sender.pickupItem(itemID);
        });

        spaceKey.on('down', (event)=> {
            client.sender.attack();
        });

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
