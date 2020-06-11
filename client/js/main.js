
const config = {
    type: Phaser.AUTO,
    width:1200,
    height: 800,
    parent:'phaser',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    dom: {
        createContainer: true
    },
    scene: [BootScene, PreloadScene, LoginScene, GameScene, PaperDollScene,InventoryScene, ShopScene, CraftingScene, SkillMenu],
};
let game;

const itemLayer = 5;
const UILayer = 99999999;
const tempCharacterLayer = 6;
const tempAboveTileLayer = 50000;

window.addEventListener('load', (event) => {
    game = new Phaser.Game(config);
});

randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let levels = [];
let maxLevel = 99;

for(let i = 0; i < maxLevel; i++){
    levels[i] = experienceForLevel(i);
}


function experienceToLevel(exp){
    let i  = 0;
    let lastLevelExp = 0;
    let level = 1;
    levels.forEach( levelExp =>{

        if(exp > lastLevelExp && exp < levelExp){
            level = i - 1;
        }
        i++;
        lastLevelExp = levelExp;
    })
    return level;
}


// let power = (level-1)/7;
// let sum = level - 1 + 300 * Math.pow(2, power);
// sum = sum /4;
// return sum


function experienceForLevel( level)
{
    let total = 0;
    for (let i = 1; i < level; i++)
    {
        total += Math.floor(i + 300 * Math.pow(2, i / 7.0));
    }

    return Math.floor(total / 4);
}