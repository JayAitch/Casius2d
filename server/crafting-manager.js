const recipes = {
    [skillLevels.BLACKSMITH]:[{
        skill: skillLevels.BLACKSMITH,
        level:0,
        experience: 150,
        items:[{item: items.goldbar, amount:10}],
        result:[items.goldhelm],
        time: 50
    },
        {
            skill: skillLevels.BLACKSMITH,
            level:0,
            experience: 150,
            items:[{item: items.goldore, amount:5}, {item: items.seeradish, amount:10}, {item: items.gem, amount:2}],
            result:[items.goldmask],
            time: 50
        },
        {
            skill: skillLevels.BLACKSMITH,
            level:0,
            experience: 150,
            items:[{item: items.goldbar, amount:10}],
            result:[items.goldlegs],
            time: 50
        },
        {
            skill: skillLevels.BLACKSMITH,
            level:0,
            experience: 150,
            items:[{item: items.goldore, amount:10}, {item: items.goldbar, amount:20}, {item: items.gem, amount:2}, {item:items.spear, amount:1}],
            result:[items.dspear],
            time: 50
        }
        ],
    [skillLevels.ALCHEMY]:[{
        skill: skillLevels.ALCHEMY,
        level:0,
        experience: 150,
        items:[{item: items.seeradish, amount:5}],
        result:[items.seeradish],
        time: 50
    },
    ],
    [skillLevels.WOODCUTTING]:[{
        skill: skillLevels.WOODCUTTING,
        level:0,
        experience: 150,
        items:[{item: items.log, amount:1}],
        result:[items.plank],
        time: 50
    },
    ]

}


global.recipesManager = {
    getRecipes: function(){
        console.log(recipes);
        return recipes;
    },
    craft: function(lookup, inv, stats){
        let recipe = recipes[lookup.skill][lookup.key];
        let itemBase  = recipe.result[0];
        let reward = recipe.experience; // add to experience somehow
        let currentExp = stats[lookup.skill] || 0;
        //todo: write the experience level relationship
        stats[lookup.skill] = currentExp + reward;

        let item = {
            base:itemBase,
            quantity: 1,
            plus: randomInteger(0, 3)
        }
        console.log(item);
        inv.pickupItem(item);
    }
}

module.exports = {recipesManager}