class SkillMenu extends Phaser.Scene {
    constructor() {
        super({key: 'skill-menu'});
        this.actionsList = new ActionsList(this);
        this.currentSkills = [];
    }

    init(data, recipes) {
        this.sender = data;
    }

    set hide(val){
        this.skillGrid.setVisible(!val);
        this.isHide = val;
    }

    get hide(){

        return this.isHide;
    }


    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });

    }

    set skills(val){

        let keys = Object.keys(val);
        let skillarr = [];
        keys.forEach(key=>{
            skillarr.push(val[key])
        })
        this.currentSkills = skillarr;
        if(this.skillGrid)
        this.skillGrid.setItems(this.currentSkills);
    }

    create() {

        this.skillGrid = this.rexUI.add.gridTable({
            background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_PRIMARY),
            x: 1000,
            y:400,
            table: {
                width: 300,
                height: 400,

                cellWidth: 150,
                cellHeight: 150,
                columns: 2,
                mask: {
                    padding: 0,
                },
            },

            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
            },
            items:  this.currentSkills,
            // scroller: true,
            createCellContainerCallback: function (cell) {
                //scene.add.image(0, 0, item.id),
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                console.log(item);
                let level = experienceToLevel(item.currentExp);
                let text = item.type + " " + level;
                text = `${text}\n ${item.currentExp}/${experienceForLevel(level + 1)}`
                let icon = scene.add.image(0, 0, "");
                icon.item = item;
                return scene.rexUI.add.label({
                    width: width,
                    height: height,
                    background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, COLOR_DARK),
                   // icon: icon,
                    text: scene.add.text(0,0, text,textStyles["list-item"]),//scene.add.text(0, 0, item.recipe.level + ": " + item.name + " - " + item.recipe.experience + "exp", textStyles["list-item"]),

                    space: {
                        icon: 10,
                        left: 15
                    }
                });
            }
        }).layout();
        this.hide = true;
    }
}


