dropLookup = {
    "rock_iron_1":{
        0:{
            item:{base: items.ironore},
            chance: 50
        },
        1:{
            item:{base: items.gem},
            chance: 5
        },
        2:{
            item:{base: items.ironore},
            chance: 50
        }
    },
    "rock_gold_1":{
        0:{
            item:{base: items.goldore},
            chance: 50
        },
        1:{
            item:{base: items.gem},
            chance: 5
        },
        2:{
            item:{base: items.goldore},
            chance: 50
        }
    },
    "rock_copper_1":{
        0:{
            item:{base: items.copperore},
            chance: 50
        },
        1:{
            item:{base: items.gem},
            chance: 5
        },
        2:{
            item:{base: items.copperore},
            chance: 50
        }
    },
    "wood_magic_1":{
        0:{
            item:{base: items.silk},
            chance: 5
        },
        1:{
            item:{base: items.log},
            chance: 50
        },
        3:{
            item:{base: items.petal},
            chance: 15
        },
        4:{
            item:{base: items.feather},
            chance: 2
        }

    },

    0:{
        0:{
        item:{base: items.leatherbelt, plus:0},
        chance: 5
        },
        1:{
            item:{base: items.seeradish},
            chance: 5
        },
        2:{
            item:{base: items.leatherbelt, plus: 100},
            chance: 5
        },
        9:{
            item:{base: items.shield, plus: 100},
            chance: 5
        },
        3:{
            item:{base: items.spear, plus: 6},
            chance: 5
        },
        4:{
            item:{base: items.dspear, plus:10000},
            chance: 5
        },
        6:{
            item:{base: items.leatherbelt, plus: 100},
            chance: 5
        },
        7:{
            item:{base: items.goldlegs, plus: 100},
            chance: 5
        },
        8:{
            item:{base: items.jacket, plus: 6},
            chance: 5
        },
        9:{
            item:{base: items.gem},
            chance: 5
        },
        10:{
            item:{base: items.goldbar},
            chance: 5
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
global.getDrop = function(id){
    return dropManager.createDrop(id);
}
module.exports={roleDrop}