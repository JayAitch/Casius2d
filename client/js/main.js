
const config = {
    type: Phaser.AUTO,
    width:800,
    height: 800,
    parent:'phaser',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    dom: {
        createContainer: true
    },
    scene: [BootScene, PreloadScene, LoginScene, GameScene, PaperDollScene,InventoryScene],
};
let game;
const itemLayer = 5;
const UILayer = 99999999;
const tempCharacterLayer = 6;
const tempAboveTileLayer = 50000;

window.addEventListener('load', (event) => {
    game = new Phaser.Game(config);
});
