
global.slotActions = {"EQUIPT":"EQUIPT","DROP":"DROP","CLICK":"CLICK"}



class Inventory{
    constructor(invent, mSize) {
        console.log(invent);
        this.inventoryItems = invent//JSON.parse(JSON.stringify(invent));
        this.maxSize = mSize || 24;
    }

    addItem(item){
        if(this.inventoryItems.length >= this.maxSize) return false;
        this.inventoryItems.push(item);
        delete item.pos

        return true;
    }
    removeItem(pos){
        let item = this.inventoryItems[pos];
        this.inventoryItems.splice(pos, 1);
        return item;
    }
    getItem(slot){
        return this.inventoryItems[slot];
    }
}

class PaperDoll{

    constructor(paperDoll) {
        this.equipment = JSON.parse(JSON.stringify(paperDoll));
    }

    addItem(key, item){
        //TODO: check requirements
        let oldItem = this.equipment[key];
        this.equipment[key] = item;
        delete item.pos

        return oldItem;
    }

    removeItem(key){
        //let item = this.inventoryItems.splice(pos, 1); //temp
        let item = this.equipment[key];
        delete this.equipment[key];
        return item;
    }
    //
    // actOnSlot(action, key, item){
    //     switch (action) {
    //         case slotActions.REMOVE:
    //             return this.removeItem(key);
    //             break;
    //         case slotActions.ADD:
    //             return this.addItem(key, item);
    //             break;
    //     }
    //
    // }
}

class InventoryManager{
    constructor(inventory, paperDoll, ownerLocation, ownerID, playerStats){
        console.log(inventory);
        this.inv = new Inventory(inventory.items);
        this.ppD = new PaperDoll(paperDoll);
        this.gold = inventory.gold;
        this.ownerID = ownerID;
        this.ownerLocation = ownerLocation;
        this.playerStats = playerStats;
    }

    get paperDoll(){
        return this.ppD.equipment;
    }

    get inventory(){

        return this.inv.inventoryItems;
    }
    get message(){
        return {inventory: this.inventory, paperDoll: this.paperDoll, gold:this.gold};
    }

    pickupItem(item){

        // let invItem = {
        //     base: items[item.id],
        //     plus: item.plus,
        //     quantity: item.quantity
        // }
        // TODO: add to paperdoll first
        let addedItem =this.inv.addItem(item)
        this.clientUpdate();
        return addedItem;
    }

    equiptItem(key, item){
        // todo: check item key

        let removedItem = this.ppD.removeItem(key);
        if(removedItem){
            //todo:
            // doesnt check invent space!!
            this.inv.addItem(removedItem);
        }
        this.ppD.addItem(key, item);
        return removedItem;
    }

    unequiptItem(key){
        let removedItem = this.ppD.removeItem(key);
        if(removedItem){
            // doesnt check invent space!!
            this.inv.addItem(removedItem);
            this.ppD.removeItem(key);
        }
        return removedItem;
    }

    dropItem(slot){
        let item = this.inv.removeItem(slot);
        return item;//this needs adding to item world
    }



    actOnPaperDollSlot(action, key, item) {
        switch (action) {
            case slotActions.CLICK:
                this.unequiptItem(key);
                this.paperDollUpdate();
                this.clientUpdate();
                break;
        }
    }

    getItem(slot){
        // todo chek if ppd or inv
        return this.inv.getItem(slot);
    }


    actOnInventorySlot(action, slot, zone, pos) {
        switch (action) {
            case slotActions.EQUIPT:
                let clickedItem = this.inv.getItem(slot);
                if(clickedItem && clickedItem.base.slot) {
                    this.equiptItem(clickedItem.base.slot, clickedItem);
                    this.inv.removeItem(slot);
                    this.paperDollUpdate();
                    this.clientUpdate();
                    this.testCalculateStats();//tempoooo
                }
                break;
            case slotActions.DROP:
                let dropItem = this.inv.getItem(slot)
                if(dropItem) {
                    let item = this.inv.removeItem(slot);
                    zone.itemWorld.addItem(pos, item);
                    this.clientUpdate();
                }
                break;
        }
    }


    paperDollUpdate(){
        ///// temp/////
        // not like this
        let zone = ZONES[this.ownerLocation.zone];
        let client = zone.zoneSender.room.clientLookup[this.ownerID];
        let key = client.player.key;
        // deffinately not like this!!
        client.player.modifyComponents();
        serverSender.propigateReload(key, this.ownerLocation);
    }


    testCalculateStats() {
        /// TEMP do this in stats!!
        let ppdKeys = Object.keys(this.paperDoll);
        let statTotals = {};
        ppdKeys.forEach((key)=>{
            let stats = this.paperDoll[key].base.stats;
            let plus =  this.paperDoll[key].plus || 0;

            let statKeys = Object.keys(stats);
            statKeys.forEach((statKey)=>{
                let statTot = statTotals[statKey] || 0
                statTotals[statKey] = statTot +(stats[statKey] + plus);
            })


        })
        let statTotalKeys =  Object.keys(statTotals);
        statTotalKeys.forEach((totalStatKey)=>{
            let stat = statTotals[totalStatKey];
            // health will break some things :)
            this.playerStats[totalStatKey] = stat;
        })

    }

    clientUpdate(){
        serverSender.clientMessage("myInventory", this.message,  this.ownerLocation, this.ownerID);
    }
}
module.exports = {InventoryManager, Inventory};