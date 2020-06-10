const recipes = {
    [skillLevels.MINING]: [{
        skill: skillLevels.MINING,
        level: 25,
        experience: 550,
        items: [{
            item: items.goldore,
            amount: 3
        }],
        result: [items.goldbar],
        time: 1000
    },
    {
        skill: skillLevels.MINING,
        level: 10,
        experience: 250,
        items: [{
            item: items.copperore,
            amount: 3
        }],
        result: [items.copperbar],
        time: 900
    },
    {
        skill: skillLevels.MINING,
        level: 0,
        experience: 250,
        items: [{
            item: items.ironore,
            amount: 3
        }],
        result: [items.ironbar],
        time: 800
    }
    ],
    [skillLevels.BLACKSMITH]: [{
        skill: skillLevels.BLACKSMITH,
        level: 0,
        experience: 150,
        items: [{
            item: items.goldbar,
            amount: 10
        }],
        result: [items.goldhelm],
        time: 100
    },
        {
            skill: skillLevels.BLACKSMITH,
            level: 0,
            experience: 150,
            items: [{
                item: items.ironbar,
                amount: 5
            },{
                item: items.plank,
                amount: 5
            }],
            result: [items.spear],
            time: 100
        },

        {
            skill: skillLevels.BLACKSMITH,
            level: 0,
            experience: 150,
            items: [{
                item: items.goldbar,
                amount: 10
            }],
            result: [items.goldmask],
            time: 100
        },
        {
            skill: skillLevels.BLACKSMITH,
            level: 10,
            experience: 150,
            items: [{
                item: items.goldbar,
                amount: 10
            }],
            result: [items.goldlegs],
            time: 5000
        },
        {
            skill: skillLevels.BLACKSMITH,
            level: 0,
            experience: 150,
            items: [{
                item: items.goldore,
                amount: 10
            }, {
                item: items.goldbar,
                amount: 20
            }, {
                item: items.gem,
                amount: 2
            }, {
                item: items.spear,
                amount: 1
            }],
            result: [items.dspear],
            time: 5000
        }
    ],
    [skillLevels.ALCHEMY]: [{
        skill: skillLevels.ALCHEMY,
        level: 0,
        experience: 150,
        items: [{
            item: items.seeradish,
            amount: 5
        }],
        result: [items.seeradish],
        time: 5000
    },],
    [skillLevels.WOODCUTTING]: [{
        skill: skillLevels.WOODCUTTING,
        level: 0,
        experience: 150,
        items: [{
            item: items.log,
            amount: 1
        }],
        result: [items.plank],
        time: 5000
    }, ],
    [skillLevels.CRAFTING]: [{
        skill: skillLevels.CRAFTING,
        level: 0,
        experience: 150,
        items: [{
            item: items.leather,
            amount: 5
        }],
        result: [items.jacket],
        time: 5000
    }]

}


global.workBenches = {

    "basicAnvil":{
        type:"ANVIL",
        recipes: {
            [skillLevels.BLACKSMITH]: recipes[skillLevels.BLACKSMITH],
            [skillLevels.MINING]: recipes[skillLevels.MINING],
        }
    },
    "carpenterTable": {
        type:"CARPENTER",
        recipes: {
            [skillLevels.WOODCUTTING]: recipes[skillLevels.WOODCUTTING]
        }
    },
    "tailorsBench":{
        type:"TAILOR",
        recipes: {
            [skillLevels.CRAFTING]: recipes[skillLevels.CRAFTING]
        }
    }

}


global.recipesManager = {
    getRecipes: function(key){
        if(!key)
            return recipes;
        return workBenches[key];
    }
    ,
    tryToCraft: function(lookup, inv, stats, rangeCheck){
        let recipe = recipes[lookup.skill][lookup.key];
        let itemBase  = recipe.result[0];

        let craftSpeed = 30;

        // TEMP preventing mutliple crafts
        if(!inv.craftingTimeout)
        inv.craftingTimeout = setTimeout(() =>{

            let invQ = this.canCraft(recipe,inv, stats);
            if(rangeCheck() && invQ.result){
                inv.removeItems(invQ.slots);
                let item = this.craft(itemBase, stats);
                this.awardExperience(recipe, stats);
                inv.pickupItem(item);
            }

            inv.craftingTimeout = undefined;
            clearTimeout(inv.craftingTimeout);

            }, recipe.time);
    },

    awardExperience: function(recipe, stats){
        let reward = recipe.experience; // add to experience somehow
        let currentExp = stats[recipe.skill] || 0;
        //todo: write the experience level relationship
        stats[recipe.skill] = currentExp + reward;
    },

    craft: function(base){
        let item = {
            base:base,
            quantity: 1,
            plus: randomInteger(0, 3)
        }
        return item;
    },

    canCraft: function (recipe, inv, stats) {
      //check level against stats
        let canCraft = false;
        let tempIngredientsID = [];
        recipe.items.forEach(function(ingred){
            tempIngredientsID.push({id:ingred.item.id, amount:ingred.amount});
        })
        let invQuery = inv.queryItems(tempIngredientsID);
        return invQuery;
    },


}

module.exports = {recipesManager}