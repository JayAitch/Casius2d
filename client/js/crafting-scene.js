let craftingInterval
class ProgressBar {

    constructor (scene, x, y,width, height, max, value)
    {

        this.x = x - width/2;
        this.y = y;
        this.value = value;
        this.maxValue = max;
        this.width = width;
        this.height = height;




        this.bar = scene.rexUI.add.slider({
            x: x,
            y: y,
            width: width,
            height: height,
            orientation: 'x',
            track: scene.rexUI.add.roundRectangle(0, 0, width - 5, height - 5, 6, COLOR_LIGHT),
            indicator: scene.rexUI.add.roundRectangle(0, 0, width - 5, height - 5, 6, COLOR_HIGHTLIGHT),
        }).layout();
        this.draw();
    }

    setValue(val){
        this.value = val;
        this.draw();
       // this.bar.value = this.value;
    }

    destroy(){
        this.bar.destroy();
    }

    setVisible(val){
        this.bar.setVisible(val);
    }

    timerUp(duration, callback){
        console.log("timer");
        this.callback = callback
        let tickspeed = 30;
        let growthPerTick =  tickspeed/duration;
        if(!window.craftingInterval)
        window.craftingInterval = setInterval(()=>{
           let finished = this.increase(growthPerTick);
           if(finished){
               this.decrease(1000);
               this.draw();
               callback();
           }
        }, tickspeed);

    }
    decrease (amount)
    {
        this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    increase (amount)
    {
        this.value += amount;

        if (this.value > this.maxValue)
        {
            this.value = this.maxValue;
        }

        this.draw();

        return (this.value === this.maxValue);
    }


    draw ()
    {
        this.bar.value = this.value;
        this.bar.progress = this.value;
    }

}

class CraftingScene extends Phaser.Scene {
    constructor() {
        super({key: 'crafting-menu'});
        this.actionsList = new ActionsList(this);
    }
    init(data, recipes){
        this.sender = data;
        //   this.recipes = recipes;
    }
    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        // this.showMenu();

    }



    buildDataFromRecipes(){
        let recipes = this.currentRecipes;

        let data = {
            name:'Recipes'
        }
        this.catetgories = Object.keys(recipes);
        this.catetgories.forEach( recipeCategory =>{
            let tempRecipes = [];
            let i = 0;
            recipes[recipeCategory].forEach( recipe =>{

                tempRecipes.push({
                    name:recipe.result[0].name,
                    recipe: recipe,
                    type:recipeCategory,
                    id:i
                })
                i++;
            });
            data[recipeCategory] = tempRecipes;
        });

        this.data = data;
    }

    set hide(val){
        this.isHide = val;
        this.tabs.setVisible(!val)
    }

    get hide(){
        return this.isHide;
    }

    create() {
        this.buildDataFromRecipes();
        var data = this.data;
        this.print = this.add.text(0, 0, '');

        let leftButtons = []

        this.catetgories.forEach(category=>{
            let button = this.createButton(this, 0, category)
            leftButtons.push(button);
        })

        let tabs = this.rexUI.add.tabs({
            x: 800,
            y: 400,

            panel: this.rexUI.add.gridTable({
                background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_PRIMARY),

                table: {
                    width: 300,
                    height: 400,

                    cellWidth: 300,
                    cellHeight: 60,
                    columns: 1,
                    mask: {
                        padding: 20,
                    },
                },

                slider: {
                    track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
                    thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
                },

                // scroller: true,
                createCellContainerCallback: function (cell) {
                    //scene.add.image(0, 0, item.id),
                    var scene = cell.scene,
                        width = cell.width,
                        height = cell.height,
                        item = cell.item,
                        index = cell.index;
                        let icon = scene.add.image(0,0,item.recipe.result[0].inventoryIcon);
                        icon.item = item;
                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, COLOR_DARK),
                        icon: icon,
                        text: scene.add.text(0, 0, item.name + " - " + item.recipe.experience + "exp"),

                        space: {
                            icon: 10,
                            left: 15
                        }
                    });
                },
            }),

            rightButtons: leftButtons,

            leftButtons: [
                this.createButton(this, 2, '+'),
                this.createButton(this, 2, '-'),
            ],

            space: {
                leftButtonsOffset: 20,
                rightButtonsOffset: 30,

                leftButton: 1,
            },
        })
            .layout()
        //.drawBounds(this.add.graphics(), 0xff0000);

        tabs
            .on('button.click', function (button, groupName, index) {
                switch (groupName) {
                    case 'right':
                        // Highlight button
                        if (this._prevTypeButton) {
                            this._prevTypeButton.getElement('background').setFillStyle(COLOR_DARK)
                        }
                        button.getElement('background').setFillStyle(COLOR_PRIMARY);
                        this._prevTypeButton = button;
                        if (this._prevSortButton === undefined) {
                            return;
                        }
                        break;

                    case 'left':
                        // Highlight button
                        if (this._prevSortButton) {
                            this._prevSortButton.getElement('background').setFillStyle(COLOR_DARK)
                        }
                        button.getElement('background').setFillStyle(COLOR_PRIMARY);
                        this._prevSortButton = button;
                        if (this._prevTypeButton === undefined) {
                            return;
                        }
                        break;
                }

                // Load items into grid table
                var items = data[this._prevTypeButton.text];
                this.getElement('panel').setItems(items).scrollToTop();
            }, tabs);

        // Grid table
        tabs.getElement('panel')
            .on('cell.click', function (cellContainer, cellIndex) {
                this.print.text += cellIndex + ': ' + cellContainer.text + '\n'
                let icon = cellContainer.getElement('icon');
                this.createDialogue(icon.item, cellIndex);
            }, this)
            .on('cell.over', function (cellContainer, cellIndex) {
                cellContainer.getElement('background')
                    .setStrokeStyle(2, COLOR_LIGHT)
                    .setDepth(1);
            }, this)
            .on('cell.out', function (cellContainer, cellIndex) {
                cellContainer.getElement('background')
                    .setStrokeStyle(2, COLOR_DARK)
                    .setDepth(0);
            }, this);

        tabs.emitButtonClick('left', 0).emitButtonClick('right', 0);
        this.tabs = tabs;
        this.hide = true;
    }


   createButton(scene, direction, text) {
        var radius;
        switch (direction) {
            case 0: // Right
                radius = {
                    tr: 20,
                    br: 20
                }
                break;
            case 2: // Left
                radius = {
                    tl: 20,
                    bl: 20
                }
                break;
        }
        return scene.rexUI.add.label({
            width: 50,
            height:40,
            background: scene.rexUI.add.roundRectangle(0, 0, 50, 50, radius, COLOR_DARK),
            text: scene.add.text(0, 0, text, {
                fontSize: '18pt'
            }),
            space: {
                left: 10
            }
        });
    }

    createResult(scene, item, iconWidth, iconHeight, id) {
        var label = scene.rexUI.add.label({
            orientation: 'y',
            icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_LIGHT),
            text: scene.add.text(0, 0, item.name),
            space: { icon: 3 }
        });
        label.recipeLookup = {skill: item.recipe.skill, key: id}
        return label;
    };

    set recipes(val) {
        this.currentRecipes = val;
        this.buildDataFromRecipes();

    }

    createDialogueLabel (scene, text, isPossertive) {
        let color = isPossertive ? COLOR_ACTION_POSSITIVE: COLOR_ACTION_NEGATIVE ;
        return scene.rexUI.add.label({
            // width: 40,
            // height: 40,

            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, color),

            text: scene.add.text(0, 0, text, {
                fontSize: '24px'
            }),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }


    createDialogue(item, index){
        if(this.dialog) {
            this.dialog.setVisible(false);
            this.sizer.setVisible();
        }
        let text = "\n\n";
        items = item.recipe.items;
        let progressBar = new ProgressBar(this, 300,100, 350, 50, 1,0);


        items.forEach(item=>{
            text = `${text}${item.item.id} x ${item.amount}\n`
        })


        var dialog = this.rexUI.add.dialog({
            x: 300,
            y: 300,

            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20,  COLOR_PRIMARY),

            title: this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20,COLOR_DARK),
                text: this.add.text(0, 0, item.name, {
                    fontSize: '24px'
                }),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),
            content: this.add.text(0, 0, text, {
                fontSize: '24px'
            }),

            actions: [
                this.createDialogueLabel(this, '1', true),
                this.createDialogueLabel(this, '5', true),
                this.createDialogueLabel(this, '10', true),
                this.createDialogueLabel(this, 'X', true),
                this.createDialogueLabel(this, 'close', false)
            ],

            space: {
                title: 25,
                content: 25,
                action: 15,

                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            align: {
                actions: 'right', // 'center'|'left'|'right'
            },

            expand: {
                content: false, // Content is a pure text object
            }
        })
            .layout()
            .popUp(0);

        this.print = this.add.text(0, 0, '');

        dialog.index = index;
        dialog
            .on('button.click',  (button, groupName, index) =>{
                this.print.text += index + ': ' + button.text + '\n';
                let lookup = {skill:dialog.item.type, key:dialog.index};
                if(button.text === "close") {
                    dialog.setVisible(false);
                    this.dialog = false;
                    progressBar.setVisible(false);
                }
                if(button.text === "1"){
                    let callback = ()=>{
                        clearInterval(window.craftingInterval);
                        window.craftingInterval = undefined;
                        console.log("callback()");
                        progressBar.setValue = 0;
                    }
                    progressBar.timerUp(dialog.item.recipe.time, callback);
                    this.sender.craftRecipe(lookup);
                    //dialog.setVisible(false);
                    //this.dialog = false;
                }

            }, this)
            .on('button.over', function (button, groupName, index) {
                button.getElement('background').setStrokeStyle(1, 0xffffff);
            })
            .on('button.out', function (button, groupName, index) {
                button.getElement('background').setStrokeStyle();
            });
        dialog.item = item;
        this.dialog = dialog;






        var sizer = this.rexUI.add.sizer({
            orientation: 1,
            x:300,y:400
        });

        sizer.add(dialog,
            {
                proportion: 0,
                align: 'center',
                padding: {left: 0, right: 0, top: 0, bottom: 0},
                expand: false,
                key: undefined,
                index: undefined
            }
        );

        sizer.add(progressBar.bar,
            {
                proportion: 0,
                align: 'center',
                padding: {left: 0, right: 0, top: 0, bottom: 0},
                expand: false,
                key: undefined,
                index: undefined
            }
        );



        sizer.layout();
        this.sizer = sizer;
    }

}


