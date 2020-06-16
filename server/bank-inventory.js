const inv = require('./inventory.js');
const MAX_BANK_SIZE = 448
class BankManager{
    constructor(bank, ownerLocation, ownerID, playerStats){
        this.mInv = new inv.Inventory(bank.items, MAX_BANK_SIZE);
        this.gold = bank.gold;
        this.ownerID = ownerID;
        this.ownerLocation = ownerLocation;
        this.playerStats = playerStats;
    }

    get inventory(){
        return this.mInv.inventoryItems;
    }

    get message(){
        return {bank: this.inventory, gold:this.gold};
    }

    addItems(items){
        if(!items.length){

        }
        else {
            items.forEach(item => {
                this.addItem(item);
            })
        }
    }

    addItem(item){
        if(item){
            let addedItem = this.mInv.addItem(item)
            this.clientUpdate();
            return addedItem;
        }
    }

    removeItems(slotarr){

        if(slotarr != undefined && !slotarr.length) {
            this.mInv.removeItem(slotarr);
            return;
        }
        // go through the array backwards so the items are removed in the correct order
        slotarr.sort(function(a, b){return a - b});
        slotarr.reverse();
        console.log(slotarr);
        slotarr.forEach(slot=>{
            this.mInv.removeItem(slot);
        })
    }


    getItem(slot){
        return this.mInv.getItem(slot);
    }
////     TEMP this is duplicate code - this will not be right as bank wants to stack infinately
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
        return itemsRemoved;
    }


////     TEMP this is duplicate code - this will not be right as bank wants to stack infinately
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
        return {result:found,slots:slots, count:foundCount}
    }

    withdrawItems(slot, inv, options){
        let clickedItem = this.mInv.getItem(slot);
        if(options){
            let amount = options.amount;
            // todo workout slots
            if(amount === "ALL"){
                let result = this.getMultipleItems(clickedItem, 48);
                let removedItems = this.removeItems(result.slots);
                inv.pickupItems(removedItems);
            }else{
                let result =  this.getMultipleItems(clickedItem, amount);
                let removedItems = this.removeItems(result.slots);
                inv.pickupItems(removedItems);
            }
        }else{

            if(clickedItem) {
                let added = inv.pickupItem(clickedItem);
                if(added){
                    // check invent space
                    this.mInv.removeItem(slot);
                    this.clientUpdate();
                }


            }
        }
        this.clientUpdate();
    }



    actOnBankSlot(action, slot, inv,options) {
        switch (action) {
            case slotActions.WITHDRAW:
                this.withdrawItems(slot, inv,options);
                break;
        }
    }






    clientUpdate(){
        serverSender.clientMessage("bank", this.message,  this.ownerLocation, this.ownerID);
    }
}
module.exports = {BankManager}