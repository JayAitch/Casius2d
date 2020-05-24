class Inventory{
    constructor(invent) {
        this.inventoryItems = invent;
    }

    addItem(item){
        this.inventoryItems.push(item);
        console.log(this.inventoryItems)
       return true;
    }
}

module.exports = {Inventory};