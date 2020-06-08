const inv = require('./inventory.js');
shops = {
    0:[
        {
            item: {base:items.goldhelm, plus: 2},
            amount: 1
        },
        {
            item: {base:items.goldhelm, plus: 4},
            amount: 12
        },
        {
            item: {base:items.goldhelm, plus: 6},
            amount: 12
        },
        {
            item: {base:items.goldhelm, plus: 8},
            amount: 12
        },
        {
            item: {base:items.jacket, plus: 2},
            amount: 12
        },
        {
            item: {base:items.jacket, plus: 4},
            amount: 12
        },
        {
            item: {base:items.jacket, plus: 6},
            amount: 12
        },
        {
            item: {base:items.jacket, plus: 8},
            amount: 12
        },
        {
            item: {base:items.dspear, plus: 2},
            amount: 12
        },
        {
            item: {base:items.dspear, plus: 4},
            amount: 12
        },
        {
            item: {base:items.dspear, plus: 6},
            amount: 12
        },
        {
            item: {base:items.dspear, plus: 8},
            amount: 12
        },
        {
            item: {base:items.goldlegs, plus: 2},
            amount: 12
        },
        {
            item: {base:items.goldlegs, plus: 4},
            amount: 12
        },
        {
            item: {base:items.goldlegs, plus: 6},
            amount: 12
        },
        {
            item: {base:items.goldlegs, plus: 8},
            amount: 12
        },
        {
            item: {base:items.leatherbelt, plus: 2},
            amount: 12
        },
        {
            item: {base:items.leatherbelt, plus: 4},
            amount: 12
        },
        {
            item: {base:items.leatherbelt, plus: 6},
            amount: 12
        },
        {
            item: {base:items.leatherbelt, plus: 8},
            amount: 12
        }
    ]
}

class ShopInventory{
    constructor(id) {
        let shopStock = shops[id];
        this.baseStock =  JSON.parse(JSON.stringify(shopStock));
        this.stock = shopStock; // this is PBR
        this.tick = 0;
        this.reStockRate = deltaTime(50);
    }

    buy(slot, inv){
        let stock = this.stock[slot];
        if(stock && stock.amount > 0){
            if(inv.gold >= stock.item.base.value){
                inv.gold -= stock.item.base.value; ////   temp
                this.stock[slot].amount -= 1;
                inv.pickupItem(stock.item);
            }
        }
    }

    sell(slot,inv){
        let item = inv.getItem(slot);
        inv.gold += item.base.value;
        inv.inv.removeItem(slot);
        this.addItemToStock(item);
    }

    addItemToStock(item){
        // todo: make this stack
        let stock = {
            item: {base: item.base, plus:item.plus},
            amount:item.quantity
        }
        this.stock.push(stock);
    }


    tickStock(){
        let stockKeys = Object.keys(this.stock);

        stockKeys.forEach((stockkey)=>{
            if(this.baseStock.hasOwnProperty(stockkey)){
                let currentStock = this.stock[stockkey];
                let baseStock = this.baseStock[stockkey];
                if(baseStock.amount > currentStock.amount){
                    this.increaseStock(currentStock);
                } else if(baseStock.amount < currentStock.amount){
                    this.reduceStock(currentStock);
                }
            }else{
                this.reduceStock(this.stock[stockkey]);
                this.removeFromStock( stockkey)
            }
        });
    }

    removeFromStock(stockkey){
        let stock = this.stock[stockkey];
        if(stock.amount <= 0){
            this.stock.splice(stockkey, 1);
            //delete this.baseStock[stockkey] //todo change to json??
        }
    }

    reduceStock(stock){
        stock.amount--;
    }

    increaseStock(stock){
        stock.amount++;
        console.log("increasing stock");
        console.log(stock);
    }

    update(){
        this.tick++;
        if(!(deltaTime(this.tick) % this.reStockRate)){
            this.tickStock();
        }
    }
}
module.exports={ShopInventory}