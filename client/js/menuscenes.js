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
        console.log("logged in" + data);
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
            console.log(item);
            let slot = this.paperDollSlots[ppdKey]
            slot.item = item;
            slotInc++;
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


let slotSize = 45;
let slotMargin = 3

class InventorySlot{
    constructor(scene,inventory,slot, x,y, clickHandler){
        this.scene = scene;
        this.slot = slot;
        this.inventory =  inventory;
        this.sprite = scene.add.image(x,y);
        this.sprite.depth = UILayer
        this.clickHandler = clickHandler;
        let rect = new Phaser.Geom.Rectangle(x -slotSize/2, y - slotSize/2, slotSize, slotSize);

        let graphics = scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.5 } });
        let zone = scene.add.zone(x, y, slotSize, slotSize);
        graphics.fillRectShape(rect);
        zone.setInteractive().on('pointerdown', ()=>{this.clickSlot()})

    }
    set amount(val){
     //   console.log(val);
    }
    set item(val){
        if(val === undefined){
            this.sprite.setTexture();
        }else{
            this.sprite.setTexture(val.id ||val.base.inventoryIcon);
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
        this.sender.clickInventorySlot(slot);
    }
}
