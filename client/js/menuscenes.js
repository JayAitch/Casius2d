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
        //this.paperDoll = {};
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
    }

    //temp
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
        this.slotWidth = 100
        this.slotHeight = 50;
        this.exSize = 15;
        this.x = 400;
        this.y = 400;
        this.itemOffset = 0;
        this.scene = scene;
        this.zones = [];
        this.graphics = [];
        this.texts =[];

        //gameObject.disableInteractive();
    }

    set actions(actionsList){
        this.cleanUp();

        let ex = new Phaser.Geom.Rectangle(
            this.x - this.exSize,
            this.y - this.exSize,
            this.exSize,
            this.exSize
        );

        let graphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.5 } });
        let exZone = this.scene.add.zone(
            this.x - this.exSize/2,
            this.y- this.exSize/2,
            this.exSize,
            this.exSize
        );

        let exText = this.scene.add.text(
            this.x - this.exSize/2,
            this.y- this.exSize/2,'X'
        );
        offsetByWidth(exText);


        this.zones.push(exZone);
        this.graphics.push(graphics);
        this.texts.push(exText);
        this.itemOffset += this.slotHeight + 2
        graphics.fillRectShape(ex);
        exZone.setInteractive().on('pointerdown', ()=>{
            this.closeActionList();
        })


        actionsList.forEach((action)=>{

            let rect = new Phaser.Geom.Rectangle(
                this.x - this.slotWidth/2,
                this.y - this.slotHeight/2 + this.itemOffset,
                this.slotWidth,
                this.slotHeight
            );

            let graphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.5 } });
            let zone = this.scene.add.zone(
                this.x,
                this.y + this.itemOffset,
                this.slotWidth,
                this.slotHeight
            );

            let actionText = this.scene.add.text(this.x,this.y + this.itemOffset,action);
            offsetByWidth(actionText);
            this.texts.push(actionText);
            this.zones.push(zone);
            this.graphics.push(graphics);
            this.itemOffset += this.slotHeight + 2
            graphics.fillRectShape(rect);
            zone.setInteractive().on('pointerdown', ()=>{
                this.handleAction(action);
            })
        })
    }
    closeActionList(){
        this.cleanUp();
    }
    cleanUp(){
        this.graphics.forEach((graphic)=>{
            graphic.clear();
            //zone.disableInteractive();
        })

        this.texts.forEach((text)=>{
            text.destroy();
            //zone.disableInteractive();
        })
        this.zones.forEach((zone)=>{
            zone.removeInteractive();
            //zone.disableInteractive();
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
        this.sprite.depth = UILayer
        this.clickHandler = clickHandler;
        let rect = new Phaser.Geom.Rectangle(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize);

        let graphics = scene.add.graphics({fillStyle: {color: 0xffffff, alpha: 0.5}});
        let zone = scene.add.zone(x, y, slotSize, slotSize);
        graphics.fillRectShape(rect);
        zone.setInteractive().on('pointerdown', () => {
            this.clickSlot();
        })
    }

    set amount(val){
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
        this.maxSlots = slots;
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
            slot.item = item;
            slotInc++;
        })



        // itemKeys.forEach(item => {
        //     let mItem = items[item]
        //     if(slotInc < this.maxSlots){
        //         let slot = this.inventorySlots[slotInc];
        //         slot.item = mItem;
        //         slot.amount = mItem.quantity;
        //     }
        //     slotInc++;
        // })
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



class InventoryScene extends  Phaser.Scene {
    constructor() {
        super({key: 'inventory'});
        this.actionsList = new ActionsList(this);

    }

    preload(){
    }
    init(data){
        this.sender = data;
    }
    set items(items){
        this.inventory.items = items;
    }

    create() {
        this.inventory = new ClientInventory(this, 500, 550, 24, 4,slotNumber=>{this.clickSlot(slotNumber)});
    }

    clickSlot(slot){
        this.actionsList.actions = ["EQUIPT", "DROP", "PRINT"];
        // maybe get actions from item?
        this.actionsList.setCallBack((action)=>{
            if(action === "PRINT"){
                this.testPrintItemStats(this.inventory.getItem(slot).slottedItem);
            }
            else{
                this.sender.clickInventorySlot(slot, action);
                this.actionsList.cleanUp();
            }

        });

    }


    testPrintItemStats(item){
        let stats = item.base.stats;
        let plus = item.plus;
        let statRow = "";
        Object.keys(stats).forEach((key)=>{
            statRow = `${statRow} ${key} : ${stats[key]} + ${plus} \n`

        })
        console.log(statRow);
    }
}
