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
class MyRectangle extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, width, height, fillColor) {
        super(scene, x, y, width, height, fillColor);
        // ...
        scene.add.existing(this);
    }
    // ...

    // preUpdate(time, delta) {}
}


class AudioPlayer{
    constructor() {
        this.equipt = game.sound.add("equip-item"); // use a config
        this.swing = game.sound.add("sword-swing"); // use a config
        this.swing.volume = 0.2;
        this.bgMusic = game.sound.add("backing-track");
        this.bgMusic.volume = 0.01;
        this.bgMusic.setLoop(true);
        this.mobPain = game.sound.add("pig-grunt"); // use a config
        this.levelUp = game.sound.add("level-sound"); // use a config
        this.footsteps = [];
        this.testFoosteps();
        this.mobPain = game.sound.add("pig-grunt");
    }
    testFoosteps(){
        for(let i = 0; i < 8; i++){
            let footstep = game.sound.add("footstep"+i)
            footstep.volume = 0.1;
            this.footsteps.push(footstep);
        }
    }
    playFootstep(){
        let footstepNumber = randomInteger(0, 8)

        let foostep = this.footsteps[footstepNumber];
        foostep.play();
    }
}


let audioPlayer;


let items;
let MAPS = {0:"map",1:"map2", 2:"map3"}
class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.mapEntities = {};
        this.floorItems = {};
        this.shopList = {};
        this.interactables  = {};
        this.time = 0;

    }

    preload(){
        this.shinyRender = game.renderer.addPipeline('Custom', new ShinyGlowRender(game));
    }

    init(data){
        this.client = new GameClient(this, data.socket);
        this.client.sender.connect();
        this.client.sender.joinZone(0);
    }

    loadPlayerData(id){
        this.playerID = id;
        let myPlayer = this.mapEntities[this.playerID];
        this.playerPhys.add(myPlayer.sprite);
        this.cameras.main.zoomTo(1.9,0);
        this.cameras.main.startFollow(myPlayer.sprite);

        // set background color, so the sky is not black
        this.cameras.main.setBackgroundColor('#ccccff');

    }


    create(){
        this.scene.launch("paperdoll", this.client.sender);
        this.scene.launch("inventory", this.client.sender);
        this.scene.launch("inventory-menu", this.client.sender);
        this.scene.launch("shop", this.client.sender);
        this.scene.launch("skill-menu", this.client.sender);
        this.scene.launch("bank-menu", this.client.sender);
        items = this.cache.json.get('items'); // unused
        this.controller = new Controller(this,this.client);
        this.interactableGroup = this.physics.add.group();
        this.playerPhys = this.physics.add.group();
    }

    printAOEDebug(data){
        let pos = data.pos;
        let width = data.width;
        let height = data.height;
        let rect = new MyRectangle(this, pos.x,pos.y, width, height);
        audioPlayer.swing.play();

        let graphics = this.add.graphics({fillStyle: {color: 0xff0000, alpha: 0.5}});
        //graphics.fillRectShape(rect);

        this.tweens.addCounter({
            from: 0.8,
            to: 0,
            duration: 500,
            yoyo:false,
            repeat: 0,
            onUpdate: (tween)=>
            {
                let value = tween.getValue();
                rect.setFillStyle(0xff0000, value);

            }
        });


    }

    loadMap(id) {
        this.removeCurrentMap();
        let key = MAPS[id];
        let map = this.make.tilemap({key: key});
        this.currentMap = map;
        this.tick = 0;
        const tileset = map.addTilesetImage("magecity", "tiles-extruded",32,32,1,2);

        //TODO: cleanup layers with array or something // we probably want the render order to be the same as tiled
        const groundLayer1 = map.createStaticLayer("ground_layer_1", tileset, 0, 0);
        const groundLayer2 = map.createStaticLayer("ground_layer_2", tileset, 0, 0);
        const groundLayer3 = map.createStaticLayer("ground_layer_3", tileset, 0, 0);

        const belowLayer1 = map.createStaticLayer("below_player_1", tileset, 0, 0);
        const belowLayer2 = map.createStaticLayer("below_player_2", tileset, 0, 0);

        const aboveLayer1 = map.createStaticLayer("above_player_1", tileset, 0, 0);
        const aboveLayer2 = map.createStaticLayer("above_player_2", tileset, 0, 0);
        const aboveLayer3 = map.createStaticLayer("above_player_3", tileset, 0, 0);

        aboveLayer1.depth = tempAboveTileLayer;
        aboveLayer2.depth = tempAboveTileLayer + 1;
        aboveLayer3.depth = tempAboveTileLayer + 2;

        audioPlayer.bgMusic.play(); // choose a song in the map data
    }

    removeCurrentMap() {
        if(this.currentMap)
            this.currentMap.destroy();
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

    levelUpFanfare(data){
        let entityId = data.key;
        let player = this.mapEntities[entityId];
        let fftext = this.add.text(player.x, player.y,`${data.type}  ${data.level}`);
        fftext.setDepth(UILayer + 999);

        var tween = this.tweens.add({
            targets: fftext,
            alpha: { from: 0, to: 1 },
            // alpha: { start: 0, to: 1 },
            // alpha: 1,
            // alpha: '+=1',
            onUpdate: function(){
              fftext.x = player.x -20;
              fftext.y = player.y - 40;
            },
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 1000,
            repeat: 0,            // -1: infinity
            yoyo: true
        });
        audioPlayer.levelUp.play();
    }

    updateShops(key, stock){
        this.shopList[key] = stock;
        let potentialEntity = this.mapEntities[key];
        if(potentialEntity.shop){
            potentialEntity.shop = stock;
            let shop = this.scene.get("shop");

            if(shop.id === key && !(shop.hide)) {
                shop.stock = stock;
            }
        }
        else if(potentialEntity){
            potentialEntity.shop = stock;
            this.interactables["shop" + key] = potentialEntity;

            this.interactableGroup.add(potentialEntity.sprite);
            let text = "shop E"
            let myPlayer = this.mapEntities[this.playerID];
            let display = new InteractDisplay(this, text);
            this.physics.add.overlap(myPlayer.sprite, potentialEntity.sprite,function(){display.showInteract(potentialEntity.pos)}, null, this);


            potentialEntity.interact = ()=>{ this.showStock(stock, key);}
        }
    }

    interactWithClosest(){
        let range = 50;

        let myPlayer = this.mapEntities[this.playerID];
        let entityKey = undefined
        let keys = Object.keys(this.interactables);
        let mapEntity = undefined;
        this.playerPhys.add(myPlayer.sprite);
        keys.forEach((key)=>{

            let potential =  this.interactables[key];
            let distance = Phaser.Math.Distance.Between(potential.x,potential.y,myPlayer.pos.x,myPlayer.pos.y);
            console.log(potential);
            // soft check temporry
            if( distance < range){
                entityKey = key;
                mapEntity = potential;
            }
        })
        if(mapEntity){
            mapEntity.interact();
        }else{

        }
    }

    recipeList(data){
        let crafting = this.scene.get("crafting-menu");
        crafting.allRecipes = data;
        crafting.recipes = data;
        this.scene.launch("crafting-menu", this.client.sender);
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


    reloadEntity(id, base, layers){
        let entity =  this.mapEntities[id];
        entity.base = base;
        entity.layers = layers;
    }
    // TODO: change to some kind of config
    newEntity(id, x, y, facing, state, base, layers, health, mHealth){
        if(layers) {
            this.mapEntities[id] = new Player(this, {x: x, y: y}, facing, state, base, layers, health, mHealth);
        }
        else{
            this.mapEntities[id] = new TestMonster(this, {x: x, y: y}, base,health,mHealth);
        }
    }

    bankItems(items){
        let bank = this.scene.get("bank-menu");
        bank.items = items.bank;
        bank.gold = items.gold;
    }

    clearEnities() {
        let entityKeys = Object.keys(this.mapEntities);
        entityKeys.forEach( (entity)=> {
            let mEntity = this.mapEntities[entity];
            mEntity.destroy();
        })
        this.mapEntities = {};
    }

    showStock(stock, key){
        let shop = this.scene.get("shop");
        shop.stock = stock;
        shop.id = key;
    }

    updateSkills(data){
        let skillsMenu = this.scene.get("skill-menu");
        skillsMenu.skills = data;
    }


    clearItems() {
        let itemKeys = Object.keys(this.floorItems);
        itemKeys.forEach( (key)=> {
            let mItem = this.floorItems[key];
            mItem.destroy();
        })
        this.floorItems = {};
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

            let entity = this.mapEntities[key];
            if(entity){
                entity.update()
            }
        });
        this.tick += 0.05;
        this.shinyRender.setFloat1("time", this.tick);
    }

    loadInventory(inventorymessage){
        let inv2 = this.scene.get("inventory-menu");
        inv2.items = inventorymessage.inventory;
        inv2.gold = inventorymessage.gold;
        let pD = this.scene.get("paperdoll");
        pD.items = inventorymessage.paperDoll;
    }


    loadBenches(benches){

        Object.keys(benches).forEach(bench=>{
            let mBench = benches[bench];
            let wb =  new WorkBench(mBench.position, mBench.type, this, mBench.recipes);
            this.interactables["bench" + bench ] = wb;
            this.interactableGroup.add(wb.sprite);

            let text = wb.interactText;
            let myPlayer = this.mapEntities[this.playerID];
            let display = new InteractDisplay(this, text);
            this.physics.add.overlap(myPlayer.sprite, wb.sprite,function(){display.showInteract(wb.pos)}, null, this);

            wb.interact = ()=>{
                let recipes = wb.recipes;
                let craft = this.scene.get("crafting-menu");
                craft.recipes = recipes;
                craft.availableRecipes = recipes;
                craft.hide = false;
            };
        })

    }



    loadBanks(banks){
        Object.keys(banks).forEach(bank=>{

            let mBench = banks[bank];
            let newBank =  new Bank(this, mBench.pos);
            this.interactables["bank" + bank] = newBank;
            this.interactableGroup.add(newBank.sprite);

            let text = newBank.interactText;
            let myPlayer = this.mapEntities[this.playerID];
            let display = new InteractDisplay(this, text);
            this.physics.add.overlap(myPlayer.sprite, newBank.sprite,function(){display.showInteract(newBank.pos)}, null, this);


            newBank.interact = ()=>{
                let craft = this.scene.get("bank-menu");
                craft.hide = false;
            };
        })
    }






    toggleCrafting(){
        let craft = this.scene.get("crafting-menu");
        let isGoingToShow = !craft.hide

        if(isGoingToShow){
            // show all recipes if it has been oppened manually
            craft.recipes = craft.allRecipes;
        }

        craft.hide = isGoingToShow;
    }

//TODO - move to seperate class
    closeAllWindows(){
        let pD = this.scene.get("paperdoll");
     //   let inv = this.scene.get("inventory");
        let inv2 = this.scene.get("inventory-menu");
        let shop = this.scene.get("shop");
        let craft = this.scene.get("crafting-menu");
        let skillMenu = this.scene.get("skill-menu");
        let bank = this.scene.get("bank-menu");
        pD.hide = true;
      //  inv.hide = true;
        inv2.hide = true;
        craft.hide = true;
        shop.hide = true;
        skillMenu.hide = true;
        craft.hide = true;
        bank.hide = true;
    }
    toggleBank(){
        let bank = this.scene.get("bank-menu");
        bank.hide = !bank.hide
    }
    toggleInventory(){
        let pD = this.scene.get("paperdoll");
   //     let inv = this.scene.get("inventory");
        let inv2 = this.scene.get("inventory-menu");
        pD.hide = !pD.hide;
  //      inv.hide = !inv.hide;
        inv2.hide = !inv2.hide;
    }

    toggleSkillMenu(){
        let skillMenu = this.scene.get("skill-menu");
        skillMenu.hide = !skillMenu.hide
    }

}





class Controller{
    constructor(scene, client){
        let leftKey = scene.input.keyboard.addKey("A");
        let rightKey = scene.input.keyboard.addKey("D");
        let upKey = scene.input.keyboard.addKey("W");
        let downKey = scene.input.keyboard.addKey("S");
        //    let spaceKey = scene.input.keyboard.addKey("SPACE");
        let spaceKey = scene.input.keyboard.addKey("SPACE");
        let ctrlKey = scene.input.keyboard.addKey("CTRL");
        let iKey = scene.input.keyboard.addKey("I");
        let eKey = scene.input.keyboard.addKey("E");
        let cKey = scene.input.keyboard.addKey("C");
        let bKey = scene.input.keyboard.addKey("B");
        let kKey = scene.input.keyboard.addKey("K");
        let escKey = scene.input.keyboard.addKey("ESC");
        this.client = client;

        //this.directionKeys = {left:leftKey, right:rightKey, up:upKey, down:downKey}
        this.directionKeys = [leftKey, rightKey, upKey, downKey]

        ctrlKey.on('down', (event)=> {
            let itemID = scene.getClosestItem();
            if(itemID)
                client.sender.pickupItem(itemID);
        });


        eKey.on('down', (event)=> {
            let shop = scene.scene.get("shop");
            let interactableID = scene.interactWithClosest();
        });
/// TEMP
        bKey.on('down', (event)=> {
            scene.toggleBank();
        });
        cKey.on('down', (event)=> {
            scene.toggleCrafting();
        });
        kKey.on('down', (event)=> {
            scene.toggleSkillMenu();
        })
        escKey.on('down', (event)=> {
            scene.closeAllWindows();
        });
        spaceKey.on('down', (event)=> {
            client.sender.attack();
        });

        iKey.on('down', (event)=> {
            scene.toggleInventory();
        });


        leftKey.on('down', (event)=> {
            client.sender.move({x: -1, y:0});
        });

        leftKey.on('up', (event)=> {

            if (!this.isAnotherDirectionKeyDown()){
                client.sender.stop();
            }

        });


        rightKey.on('down', (event)=> {
            client.sender.move({x:1, y:0});
        });

        rightKey.on('up', (event)=> {
            if (!this.isAnotherDirectionKeyDown()){
                client.sender.stop();
            }
        });

        upKey.on('down', (event)=> {
            client.sender.move({x:0, y:-1});
        });

        upKey.on('up', (event)=> {
            if (!this.isAnotherDirectionKeyDown()){
                client.sender.stop();
            }
        });

        downKey.on('down', (event)=> {
            client.sender.move({x:0, y:1});
        });
        downKey.on('up', (event)=> {
            if (!this.isAnotherDirectionKeyDown()){
                client.sender.stop();
            }
        });
    }

    isAnotherDirectionKeyDown(){
        let isDown = false;
        this.directionKeys.forEach((key)=>{
            if(key.isDown){
                let button = this.directionKeys[key];
                isDown = true;
            }
        })
        return isDown;
    }
}
