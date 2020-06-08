const COLOR_PRIMARY = 0x444444;
const COLOR_DARK = 0x000000;
const COLOR_LIGHT = 0xffffff;


const textStyles = {
    "header": {
        fill: '#777',
        fontFamily: "arial",
        fontSize: "48px",
    },
    "gold": {
        fill: '#333',
        fontFamily: "arial",
        fontSize: "24px",
    },
    "menu-header": {
        fill: '#777',
        fontFamily: "arial",
        fontSize: "24px",
    },
    "menu-body": {
        fill: '#777',
        fontFamily: "arial",
        fontSize: "14px",
    },
    "button":{
        fill: '#777',
        fontFamily: "arial",
        fontSize: "14px",
    }
}


class LoginScene extends  Phaser.Scene {
    constructor() {
        super({key: 'loginscene'});

    }

    preload() {
    }

    create() {
        this.client = new LoginClient(this, cip, csocket);
        this.client.sender.connect();
        this.loginForm = this.add.dom(400, 400).createFromCache('loginform');
        this.usernameField = this.loginForm.getChildByName('username');
        this.passwordField = this.loginForm.getChildByName('password');
        let loginBtn = this.loginForm.getChildByName('login');
        let newBtn = this.loginForm.getChildByName('new');

        loginBtn.addEventListener("click", (event)=>{
            event.preventDefault();
            this.loginHandler();
        });
        newBtn.addEventListener("click", (event)=>{
            event.preventDefault();
            this.createHandler();
        });
    }

    loginHandler(){
        this.client.sender.login(this.usernameField.value,this.passwordField.value);
    }

    createHandler(){
        this.client.sender.createAccount(this.usernameField.value,this.passwordField.value);
    }


    loggedIn(data){
        let mainGameScene = this.scene.start('maingame',{ socket: this.client.socket });
    }
}


class PaperDollScene extends  Phaser.Scene {
    constructor() {
        super({key: 'paperdoll'});
        this.slots = {0:"HEAD",1:"BODY",2:"BELT",3:"LEGS", 4:"BOOTS", 5:"WEAPON", 6:"OFFHAND"}//temp

    }

    preload(){
    }
    init(data){
        this.sender = data;
    }
    create() {
        //let slotKeys = this.slots;
        let slotKeys = Object.keys(this.slots);
        // maybe both clicks?
        this.paperDoll = new PaperDoll(this, 100, 550, slotKeys.length, 2, slotNumber=>{this.clickSlot(slotNumber)});
        this.hide = true;
    }

    set hide(val){
        this.paperDoll.hide = val;
        this.isHide = val;
    }
    get hide(){
        return this.isHide;
    }

    set items(items){
        this.paperDoll.items = items;
    }

    clickSlot(slot){
        this.sender.clickPaperDollSlot(slot);
    }
}

class PaperDoll{
    constructor(scene, x, y, slots, row, slotClickHandler) {
        //this.slots = {"HEAD":"HEAD","BODY":"BODY","BELT":"BELT","LEGS":"LEGS", "BOOTS":"BOOTS", "WEAPON":"WEAPON", "OFFHAND":"OFFHAND"}//temp
        this.slots = {"0":"HEAD","1":"BODY","2":"BELT","3":"LEGS", "4":"BOOTS", "5":"WEAPON", "6":"OFFHAND"}//temp
        this.paperDollSlots = {};
        this.slotKeys = Object.keys(this.slots);
        this.slotClickHandler = slotClickHandler;
        this.scene  = scene;
        this.slotY =  y;
        this.slotX = x;
        this.startX = x;
        this.createRow(this.slotKeys);

    }

    set items(items) {
        let slotInc = 0;
        let itemKeys = Object.keys(items);
        let ppdKeys = Object.keys(this.paperDollSlots);
        ppdKeys.forEach(ppdKey => {
            let item = items[ppdKey];
            let slot = this.paperDollSlots[ppdKey]
            slot.item = item;
            slotInc++;
        })
        audioPlayer.equipt.play();
    }


    set hide(val){
        let ppdKeys = Object.keys(this.paperDollSlots);
        ppdKeys.forEach(ppdKey => {
            let slot = this.paperDollSlots[ppdKey]
            slot.hide = val;
        })
    }


    createRow(slotKeys){
        slotKeys.forEach(slotKey=>{
            let paperDollKey = this.slots[slotKey]
            let nSlot = new InventorySlot(this.scene, this, paperDollKey, this.slotX, this.slotY,this.slotClickHandler);
            this.paperDollSlots[paperDollKey] = nSlot;
            this.slotX += slotSize;
            this.slotX += slotMargin;
        })
        this.slotX = this.startX;
    }
}


class ActionsList{
    constructor(scene) {
        this.slotWidth = 50
        this.slotHeight = 50;
        this.exSize = 35;
        this.x = 400;
        this.y = 600;
        this.itemOffset = 0;
        this.scene = scene;
        this.zones = [];
        this.graphics = [];
        this.texts =[];

        //gameObject.disableInteractive();
    }

    set actions(actionsList){
        this.showActionList(actionsList);
    }


    set target(slot){
        this.cleanUp();
        this.showItemInspector(slot);
    }

    set hide(val){
        if(val){
            this.cleanUp();
        }
    }

    closeActionList(){
        this.cleanUp();
    }

    showActionList(actionsList){
        let yOffset = -15;

        let ex = new Phaser.Geom.Rectangle(
            this.x - this.exSize,
            this.y + yOffset,
            //   this.x,
            //   this.y,
            this.exSize,
            this.exSize
        );

        let graphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.9 } });
        let exZone = this.scene.add.zone(
            this.x - this.exSize/2,
            this.y + yOffset,
            // this.x,
            // this.y - this.exSize,
            this.exSize,
            this.exSize
        );
        graphics.depth = UILayer + 15;
        let exText = this.scene.add.text(
            this.x - this.exSize/2,
            this.y,
            'X',
            textStyles.button
        );

        graphics.depth = UILayer + 99999;
        offsetByWidth(exText);


        this.zones.push(exZone);
        this.graphics.push(graphics);
        this.texts.push(exText);
        this.itemOffset += this.slotHeight + 2
        graphics.fillRectShape(ex);
        exZone.setInteractive().on('pointerdown', ()=>{
            console.log("pressed the X");
            this.closeActionList();
        })


        actionsList.forEach((action)=>{
            this.createAction(action);
        })

        let sScene = this.scene.scene.get("shop");
        ////  temp
        if(sScene.id){
            this.createAction("SELL");
        }
    }


    createAction(action){
        let rect = new Phaser.Geom.Rectangle(
            this.x - this.slotWidth/2,
            this.y - this.slotHeight/2 + this.itemOffset,
            this.slotWidth,
            this.slotHeight
        );

        let graphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.9 } });
        let zone = this.scene.add.zone(
            this.x,
            this.y + this.itemOffset,
            this.slotWidth,
            this.slotHeight
        );
        graphics.depth = UILayer + 999999;
        let actionText = this.scene.add.text(this.x,this.y + this.itemOffset,action,textStyles.button);
        actionText.setDepth( UILayer + 999999);
        offsetByWidth(actionText);
        this.texts.push(actionText);
        this.zones.push(zone);
        this.graphics.push(graphics);
        this.itemOffset += this.slotHeight + 2
        graphics.fillRectShape(rect);
        zone.setInteractive().on('pointerdown', ()=>{
            this.handleAction(action);
        })
    }
    showItemInspector(slot){
        let item = slot.slottedItem;
        this.x = slot.x;
        this.y = slot.y;
        let graphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.5 } });
        let rect = new Phaser.Geom.Rectangle(
            30, 30, 400, 400
        );
        graphics.fillRectShape(rect);
        this.graphics.push(graphics);

        let plus = item.plus;
        let itemName = item.base.name;
        if(plus) itemName = `${itemName} + ${plus}`

        let itemstring = "\n";
        let descString = item.base.description || "";


        let stats = item.base.stats
        if(stats !== undefined){
            Object.keys(stats).forEach((key)=>{
                itemstring = `${itemstring} ${key} : ${stats[key]} + ${plus} \n`
            })
        }
        let nameText = this.scene.add.text(30 ,30, itemName, textStyles["menu-header"]);
        let descText = this.scene.add.text(30 ,60, descString, textStyles["menu-body"]);
        let statTexts = this.scene.add.text(30 ,80, itemstring, textStyles["menu-body"]);
        this.texts.push(statTexts);
        this.texts.push(descText);
        this.texts.push(nameText);
    }



    cleanUp(){
        this.graphics.forEach((graphic)=>{
            graphic.clear();
        })

        this.texts.forEach((text)=>{
            text.destroy();
        })
        this.zones.forEach((zone)=>{
            zone.removeInteractive();
        })
        this.itemOffset = 0;
    }

    setCallBack(callback){
        this.clickTarget = callback;
    }


    set callBack(val){
        this.clickTarget = val;
    }

    handleAction(action){
        this.clickTarget(action);
    }
}

let slotSize = 45;
let slotMargin = 3




function offsetByWidth(obj){
    let offset = obj.width / 2;
    obj.x = obj.x - offset;
}


class InventorySlot{
    constructor(scene,inventory,slot, x,y, clickHandler) {
        this.scene = scene;
        this.slot = slot;
        this.inventory = inventory;
        this.sprite = scene.add.image(x, y);
        this.x = x;
        this.y = y;
        this.sprite.depth = UILayer
        this.clickHandler = clickHandler;
        let rect = new Phaser.Geom.Rectangle(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize);

        this.graphics = scene.add.graphics({fillStyle: {color: 0xffffff, alpha: 0.5}});
        this.zone = scene.add.zone(x, y, slotSize, slotSize);
        this.graphics.fillRectShape(rect);
        this.zone.setInteractive().on('pointerdown', () => {
            this.clickSlot();
        })

    }

    set amount(val){
    }

    set hide(val){
        if(!val){
            this.zone.setInteractive();
            this.graphics.alpha = 0.5;
            this.sprite.alpha = 1;
        } else {
            this.zone.disableInteractive();
            this.graphics.alpha = 0;
            this.sprite.alpha = 0;
        }
    }

    set item(val){
        this.slottedItem = val;
        if(val === undefined){
            this.sprite.setTexture();
        }else{
            this.sprite.setTexture(val.base.inventoryIcon || val.id);
        }
    }

    clickSlot(param){
        this.clickHandler(this.slot);
    }

}



class ClientInventory{
    constructor(scene, x, y, slots, row,slotClickHandler) {
        this.inventorySlots = [];
        this.startX = x;
        this.slotX = x;
        this.slotY = y;
        this.slotCount = 0;
        this.scene = scene;
        this.slotClickHandler = slotClickHandler;

        for(let i = 0; i < row; i++){
            let columnCount = slots / row;
            this.createRow(columnCount);
            this.slotY += slotSize;
            this.slotY += slotMargin;
        }
        if(slots % row){
            this.createRow(slots % row);
        }

    }

    getItem(slot){
        return this.inventorySlots[slot];
    }

    set items(items){
        let slotInc = 0;
        let itemKeys = Object.keys(items);
        this.inventorySlots.forEach(slot => {
            let itemkey = itemKeys[slotInc];
            let item = items[itemkey];
            if(item && item.item){
                slot.item = item.item || item;// todo: show amount
            }else{
                slot.item = item;// todo: show amount
            }

            slotInc++;
        })
    }

    set hide(val){
        this.inventorySlots.forEach(slot => {
            slot.hide = val;
        })
    }


    createRow(slots){
        for(let i = 0; i < slots; i++){
            let nSlot = new InventorySlot(this.scene,this, this.slotCount, this.slotX, this.slotY,this.slotClickHandler);
            this.inventorySlots[this.slotCount] = nSlot;
            this.slotCount++;
            this.slotX += slotSize;
            this.slotX += slotMargin;
        }

        this.slotX = this.startX;
    }
}










class ShopScene extends Phaser.Scene {
    constructor() {
        super({key: 'shop'});
        this.actionsList = new ActionsList(this);
    }

    init(data){
        this.sender = data;
    }
    create(){
        this.inventory = new ClientInventory(this, 510, 400, 24, 4,slotNumber=>{this.clickSlot(slotNumber)});
        this.inventory.hide = true;
    }


    set hide(val){
        this.inventory.hide = val;
    }

    set id(id){
       this.shopId = id;
    }
    get id(){
        return this.shopId;
    }
    set stock(val){
        this.inventory.hide = false;
        this.inventory.items = val;
    }

    clickSlot(slot){
        this.actionsList.target = this.inventory.getItem(slot);
        this.actionsList.actions = ["BUY"];

        // maybe get actions from item?
        this.actionsList.setCallBack((action)=>{
            this.sender.clickShopSlot(slot, action, this.shopId);
            this.actionsList.cleanUp();
        });

    }
}




class InventoryScene extends  Phaser.Scene {
    constructor() {
        super({key: 'inventory'});
        this.actionsList = new ActionsList(this);
    }

    init(data){
        this.sender = data;
    }
    set items(items){
        this.inventory.items = items;
    }

    set hide(val){
        this.goldText.setAlpha(val ? 0: 1);
        this.inventory.hide = val;
        this.isHide = val;
        this.actionsList.hide = val;
    }
    set gold(val){
        this.goldText.setText(val);
    }

    get hide(){

        return this.isHide;
    }
    create() {
        this.goldText = this.add.text(510 ,560, "0", textStyles.gold);
        this.inventory = new ClientInventory(this, 510, 610, 24, 4,slotNumber=>{this.clickSlot(slotNumber)});
        this.hide = true;
    }

    clickSlot(slot){
        this.actionsList.target = this.inventory.getItem(slot);
        this.actionsList.actions = ["EQUIPT", "DROP"];

        // maybe get actions from item?
        this.actionsList.setCallBack((action)=>{
            let data ={
                slot:slot, action:action
            }
            //     temp
            if(action === "SELL") {
                let sScene = this.scene.get("shop");
                data.id = sScene.id;
            }
            this.sender.clickInventorySlot(data);
            this.actionsList.cleanUp();
        });

    }

}
