class Inventory{
    constructor(invent) {
        this.inventoryItems = JSON.parse(JSON.stringify(invent));
        this.maxSize = 24;
    }

    addItem(item){
        if(this.inventoryItems.length >= this.maxSize) return false;
        this.inventoryItems.push(item);
        console.log(item);
        delete item.pos

        return true;
    }
    removeItem(pos){
        //let item = this.inventoryItems.splice(pos, 1); //temp
        let item = this.inventoryItems[pos];
        //console.log(this.inventoryItems)
        return item;
    }
}

module.exports = {Inventory};