
const config = {
    type: Phaser.AUTO,
    width:1200,
    height: 1200,
    parent:'phaser',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    dom: {
        createContainer: true
    },
    scene: [BootScene, PreloadScene, LoginScene, GameScene, PaperDollScene],
};
let game;
window.addEventListener('load', (event) => {
    game = new Phaser.Game(config);
});
