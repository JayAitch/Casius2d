dropLookup = {
    0:{
        0:{
        item:{base: items.goldhelm, plus:0},
        chance: 5
        },
        1:{
            item:{base: items.seeradish},
            chance: 5
        },
        2:{
            item:{base: items.leatherbelt, plus: 100},
            chance: 50
        },
        3:{
            item:{base: items.shield, plus: 100},
            chance: 50
        },
        3:{
            item:{base: items.dspear, plus: 6},
            chance: 50
        }
    }
};


const dropManager = {
    drops: {},
    createDrops: function(){
        let dropsLookup = Object.keys(dropLookup);

        dropsLookup.forEach(key=>{
            let singleDrop = dropLookup[key];
            let singleDropLookup = Object.keys(singleDrop);

            let rolledChance = [];
            singleDropLookup.forEach( singleKey =>{
                let itemInDrop = singleDrop[singleKey];
                let chance = itemInDrop.chance;
                for(let i = 0; i < chance;i++){
                    rolledChance.push(itemInDrop.item);
                }
            })

            this.drops[key] = rolledChance;
        })

    },
    createDrop: function(id){
        let drop = this.drops[id];
        let dropPosition = randomInteger(0, drop.length - 1);
        let droppedItem = drop[dropPosition];
        return droppedItem;

    }
}

randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
dropManager.createDrops();

function roleDrop(id){
    return dropManager.createDrop(id);
}

module.exports={roleDrop}