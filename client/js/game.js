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


class PaperDollScene extends  Phaser.Scene {
    constructor() {
        super({key: 'paperdoll'});
        this.slots = {"HEAD":"HEAD","BODY":"BODY","BELT":"BELT","LEGS":"LEGS", "BOOTS":"BOOTS", "WEAPON":"WEAPON", "OFFHAND":"OFFHAND"}
    }

    preload(){
    }

    create() {
        this.paperDoll = this.add.dom(100, 600).createFromCache('paperdoll');
        let node = this.paperDoll.node

        let slots = node.querySelectorAll(".inventory_slot");
        slots.forEach((slot)=>{
            slot.addEventListener('click', (event)=>{
                let slotName = this.slots[slot.getAttribute("slot")];
                this.clickSlot(slotName);
            });
        });

    }

    clickSlot(slot){
        console.log(slot);
    }
}

let items;
let MAPS = {0:"map",1:"map2"}
class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
    }


    preload(){
    }

    init(data){
        this.client = new GameClient(this, data.socket);
        this.client.sender.connect();
        this.client.sender.joinZone(0);
    }

    create(){
        this.scene.launch("paperdoll");
        items = this.cache.json.get('items');
        this.controller = new Controller(this,this.client);
    }


    loadMap(id){
        let key = MAPS[id];
        const map = this.make.tilemap({ key: key });
        const tileset = map.addTilesetImage("magecity", "tiles");
        const belowLayer = map.createStaticLayer("Ground Layer", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("Below player", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Above player", tileset, 0, 0);
    }

    newEntity(id, x, y, facing, state, base, layers){
        this.mapEntities[id] = new Player(this, {x:x,y:y}, facing, state, base, layers);
    }

    // clearEnities() {
    //     let entityKeys = Object.keys(this.mapEntities);
    //     entityKeys.forEach(function (entity) {
    //         entity.destroy();
    //     })
    //     this.mapEntities = {};
    // }

    moveEntity(id, x, y, facing, state){
        let entity = this.mapEntities[id];
        if(entity){
            entity.newPosition = {x:x, y:y};
            entity.facing = facing;
            entity.state = state;
        }

    }
    removeEntity(id){
        let entity = this.mapEntities[id];
        if(entity)
        entity.destroy();
        this.mapEntities.splice(id, 1)
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
    //    let spaceKey = scene.input.keyboard.addKey("SPACE");
        let spaceKey = scene.input.keyboard.addKey("SPACE");


        this.client = client;

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
