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
        this.slots = {"HEAD":"HEAD","BODY":"BODY","BELT":"BELT","LEGS":"LEGS", "BOOTS":"BOOTS", "WEAPON":"WEAPON", "OFFHAND":"OFFHAND"}
    }

    preload(){
    }

    create() {
        this.paperDoll = this.add.dom(100, 550).createFromCache('paperdoll');
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



let slotSize = 45;
let slotMargin = 3

class InventorySlot{
    constructor(scene,inventory,slot, x,y){
        this.scene = scene;
        this.slot = slot;
        this.inventory =  inventory;
        this.sprite = scene.add.image(x,y);
        this.sprite.depth = UILayer

        let rect = new Phaser.Geom.Rectangle(x -slotSize/2, y - slotSize/2, slotSize, slotSize);

        let graphics = scene.add.graphics({ fillStyle: { color: 0xffffff,alpha:0.5 } });
        let zone = scene.add.zone(x, y, slotSize, slotSize);
        graphics.fillRectShape(rect);
        zone.setInteractive().on('pointerdown', ()=>{this.clickSlot()})

    }
    set amount(val){
        console.log(val);
    }
    set item(val){
        this.sprite.setTexture(val.id);
    }
    clickSlot(param){
        console.log(this.slot);
    }

}



class ClientInventory{
    constructor(scene, x, y, slots, row) {
        this.inventorySlots = [];
        this.maxSlots = slots;
        this.startX = x;
        this.slotX = x;
        this.slotY = y;
        this.slotCount = 0;
        this.scene = scene;

        for(let i = 0; i < row; i++){
            let columnCount = slots / row;
            this.createRow(columnCount);
            this.slotY += slotSize;
            this.slotY += slotMargin;
        }
    }
    set items(items){
        let slotInc = 0;
        let itemKeys = Object.keys(items);
        itemKeys.forEach(item => {
            let mItem = items[item]
            if(slotInc < this.maxSlots){
                let slot = this.inventorySlots[slotInc];
                slot.item = mItem;
                slot.amount = mItem.quantity;
            }
            slotInc++;
        })
    }

    createRow(slots){
        for(let i = 0; i < slots; i++){
            let nSlot = new InventorySlot(this.scene,this, this.slotCount, this.slotX, this.slotY);
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

    set items(items){
        this.inventory.items = items;
    }

    create() {
        this.inventory = new ClientInventory(this, 500, 550, 24, 4);
    }

    clickSlot(slot){
        console.log(slot);
    }
}
