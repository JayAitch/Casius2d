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
        // todo chek if ppd or inv
        return this.mInv.getItem(slot);
    }


    actOnBankSlot(action, slot, inv) {
        switch (action) {
            case slotActions.WITHDRAW:
                let clickedItem = this.mInv.getItem(slot);
                if(clickedItem) {
                    let added = inv.pickupItem(clickedItem);

                    if(added){
                        // check invent space
                        this.mInv.removeItem(slot);
                        this.clientUpdate();
                    }
                }
                break;
        }
    }






    clientUpdate(){
        serverSender.clientMessage("bank", this.message,  this.ownerLocation, this.ownerID);
    }
}
module.exports = {BankManager}