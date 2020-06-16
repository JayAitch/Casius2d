
global.slotActions = {"EQUIP":"EQUIP","DROP":"DROP","CLICK":"CLICK", "WITHDRAW":"WITHDRAW", "DEPOSIT":"DEPOSIT"}

global.PLAYER_INVENT_MAX = 84

class Inventory{
    constructor(invent, mSize) {
        this.inventoryItems = invent//JSON.parse(JSON.stringify(invent));
        this.maxSize = mSize || 24;
    }

    addItem(item){
        if(this.inventoryItems.length >= this.maxSize) return false;
        this.inventoryItems.push(item);
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
        this.mInv = new Inventory(inventory.items,PLAYER_INVENT_MAX);
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
        return this.mInv.inventoryItems;
    }
    get message(){
        return {inventory: this.inventory, paperDoll: this.paperDoll, gold:this.gold};
    }

    queryItems(items){
        let foundAll = true;
        let itemSlots = [];

        items.forEach(qItem=>{
            let itemSearchInc = 0;
            let itemFound = false;
            let foundCount = 0;
                this.inventory.forEach(item=>{
                    if(!itemFound){
                        if(item.base.id === qItem.id) {
                            itemSlots.push(itemSearchInc);
                            foundCount++;
                            if(foundCount === qItem.amount){
                                itemFound = true;
                            }

                        }
                        itemSearchInc++;
                    }

                })
            if(foundAll !=false){
                foundAll = itemFound;
            }
        })
        let result = {
            result: foundAll,
            slots:itemSlots
        }
        return result;
    }


     getMultipleItems(qItem, amount){
        let slots = []
        let itemSearchInc = 0;
        let foundCount = 0;
        let found = false;
        this.inventory.forEach( item =>{
            if(!found){
                // TODO also check +
                if(item.base.id === qItem.base.id) {
                    slots.push(itemSearchInc);
                    foundCount++;
                    if(foundCount === amount){
                        found = true;
                    }

                }
                itemSearchInc++;
            }

        });
        console.log({result:found,slots:slots, count:foundCount});
        return {result:found,slots:slots, count:foundCount}
    }

    pickupItems(items){

        // let invItem = {
        //     base: items[item.id],
        //     plus: item.plus,
        //     quantity: item.quantity
        // }
        // TODO: add to paperdoll first
        if(items && items.length){
            items.forEach(item =>{
                console.log(item)
                let addedItem = this.mInv.addItem(item);
                this.clientUpdate();
            })
        }
    }


    pickupItem(item){

        // let invItem = {
        //     base: items[item.id],
        //     plus: item.plus,
        //     quantity: item.quantity
        // }
        // TODO: add to paperdoll first
        if(item){
            let addedItem = this.mInv.addItem(item)
            this.clientUpdate();
            return addedItem;
        }

    }

    equiptItem(key, item){
        // todo: check item key

        let removedItem = this.ppD.removeItem(key);
        if(removedItem){
            //todo:
            // doesnt check invent space!!
            this.mInv.addItem(removedItem);
        }
        this.ppD.addItem(key, item);
        return removedItem;
    }

    removeItems(slotarr){
        console.log(slotarr.length);
        if(slotarr != undefined && !slotarr.length) {
            this.mInv.removeItem(slotarr);
            return;
        }
        // go through the array backwards so the items are removed in the correct order
        slotarr.sort(function(a, b){return a - b});
        slotarr.reverse();
        console.log(slotarr);
        let itemsRemoved = [];
        slotarr.forEach(slot=>{
            let item =this.mInv.removeItem(slot);
            itemsRemoved.push(item);
        })
        this.clientUpdate();
        return itemsRemoved;
    }


    unequiptItem(key){
        let removedItem = this.ppD.removeItem(key);
        if(removedItem){
            // doesnt check invent space!!
            this.mInv.addItem(removedItem);
            this.ppD.removeItem(key);
        }
        return removedItem;
    }

    // dropItem(slot){
    //     let item = this.mInv.removeItem(slot);
    //     return item;//this needs adding to item world
    // }



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
        return this.mInv.getItem(slot);
    }

    removeItemsAmount(slot, amount){
        let removedItems;
        if(amount){
            if(amount === "ALL"){
                let count = 48
                // remove from invent
                let item = this.mInv.getItem(slot)
                let result = this.getMultipleItems(item, count)
                removedItems = this.removeItems(result.slots);
            }else{
                let item = this.mInv.getItem(slot)
                let result = this.getMultipleItems(item, amount);
                removedItems = this.removeItems(result.slots);
            }
        }else{
            let dropItem = this.mInv.getItem(slot)
            if(dropItem) {
                let izone = ZONES[this.ownerLocation.zone];
                let item = this.mInv.removeItem(slot);
                izone.itemWorld.addItem(pos, item);
                removedItems = item;
            }
        }
        this.clientUpdate();
        return removedItems;
    }


    dropItem(pos, slot, amount){
        if(amount){
            if(amount === "ALL"){
                let count = 48
                // remove from invent
                let item = this.mInv.getItem(slot)
                let result = this.getMultipleItems(item, count);
                this.dropItemLots(result.count,pos, item);
                this.removeItems(result.slots);
            }else{
                let item = this.mInv.getItem(slot)
                let result = this.getMultipleItems(item, amount);
                this.dropItemLots( result.count,pos, item);
                this.removeItems(result.slots);
            }
        }else{
            let dropItem = this.mInv.getItem(slot)
            if(dropItem) {
                let izone = ZONES[this.ownerLocation.zone];
                let item = this.mInv.removeItem(slot);
                izone.itemWorld.addItem(pos, item);

            }
        }
        this.clientUpdate();
    }

    dropItemLots(amount, pos, item){
        let izone = ZONES[this.ownerLocation.zone];
        for(let i = 0; i < amount; i++){
            izone.itemWorld.addItem(pos, item);
            this.clientUpdate();
        }
    }

    actOnInventorySlot(action, slot, zone, pos, bank, options) {
        switch (action) {
            case slotActions.EQUIP:
                let clickedItem = this.mInv.getItem(slot);
                if(clickedItem && clickedItem.base.slot) {
                    this.equiptItem(clickedItem.base.slot, clickedItem);
                    this.mInv.removeItem(slot);
                    this.paperDollUpdate();
                    this.clientUpdate();
                    this.testCalculateStats();//tempoooo
                }
                break;
            case slotActions.DROP:
                this.dropItem(pos,slot, options.amount);
                this.clientUpdate();
                break;
            case slotActions.BANK:

                let removedItems = this.removeItemsAmount(slot, options.amount);
                bank.addItems(removedItems);
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