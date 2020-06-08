


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
        this.tabs.setVisible(val)
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
                    height: 600,

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

    createDialogueLabel (scene, text) {
        return scene.rexUI.add.label({
            // width: 40,
            // height: 40,

            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

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
        if(this.dialog) this.dialog.setVisible(false);
        let text = "";
        items = item.recipe.items;

        items.forEach(item=>{
            text = `${text}${item.item.id} x ${item.amount}\n`
        })


        var dialog = this.rexUI.add.dialog({
            x: 300,
            y: 300,

            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

            title: this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
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
            // content: this.add.sprite(0, 0, 'item', {
            //     fontSize: '24px'
            // }),

            actions: [
                this.createDialogueLabel(this, '1'),
                this.createDialogueLabel(this, '5'),
                this.createDialogueLabel(this, '10'),
                this.createDialogueLabel(this, 'X'),
                this.createDialogueLabel(this, 'cancel')
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
            // .drawBounds(this.add.graphics(), 0xff0000)
            .popUp(1000);

        this.print = this.add.text(0, 0, '');

        dialog.index = index;
        dialog
            .on('button.click',  (button, groupName, index) =>{
                this.print.text += index + ': ' + button.text + '\n';
                let lookup = {skill:dialog.item.type, key:dialog.index};
                if(button.text === "cancel") {
                    dialog.setVisible(false);
                    this.dialog = false;
                }
                if(button.text === "1"){
                    console.log(dialog.item)
                    this.sender.craftRecipe(lookup);
                    console.log(lookup)
                    dialog.setVisible(false);
                    this.dialog = false;
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

    }



    clickHandler(lookup){
        this.sender.craftRecipe(lookup);
    }



    get recipes(){
        //  return this.recipesShowing;
    }

}




//
//
// class CraftingScene extends Phaser.Scene {
//     constructor() {
//         super({key: 'crafting-menu'});
//         this.actionsList = new ActionsList(this);
//     }
//     init(data, recipes){
//         this.sender = data;
//      //   this.recipes = recipes;
//     }
//     preload() {
//         this.load.scenePlugin({
//             key: 'rexuiplugin',
//             url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
//             sceneKey: 'rexUI'
//         });
//        // this.showMenu();
//
//     }
//
//
//
//     buildDataFromRecipes(){
//        let recipes = this.currentRecipes;
//
//         let data = {
//             name:'Recipes'
//         }
//         this.catetgories = Object.keys(recipes);
//         this.catetgories.forEach( recipeCategory =>{
//             let tempRecipes = [];
//             let reci = recipes[recipeCategory]
//             console.log(recipeCategory);
//             recipes[recipeCategory].forEach( recipe =>{
//                 console.log(recipe);
//                 tempRecipes.push({
//                     name:recipe.result[0].name,
//                     recipe: recipe
//                 })
//             });
//             data[recipeCategory] = tempRecipes;
//         });
//
//         this.data = data;
//     }
//
//
//
//     create() {
//         this.buildDataFromRecipes();
//         var data = this.data;
//         // var data = {
//         //     name: 'Rex',
//         //     skills: [
//         //         { name: 'A' },
//         //         { name: 'B' },
//         //         { name: 'C' },
//         //         { name: 'D' },
//         //         { name: 'E' },
//         //     ],
//         //     items: [
//         //         { name: 'A' },
//         //         { name: 'B' },
//         //         { name: 'C' },
//         //         { name: 'D' },
//         //         { name: 'E' },
//         //         { name: 'F' },
//         //         { name: 'G' },
//         //         { name: 'H' },
//         //         { name: 'I' },
//         //         { name: 'J' },
//         //         { name: 'K' },
//         //         { name: 'L' },
//         //         { name: 'M' },
//         //     ],
//         //
//         // };
//
//         this.print = this.add.text(0, 0, '');
//         this.scrollablePanel = this.rexUI.add.scrollablePanel({
//             x: 400,
//             y: 300,
//             width: 400,
//             height: 600,
//
//             scrollMode: 1,
//
//             background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),
//
//             panel: {
//                 child: this.createPanel(this, data),
//
//                 mask: {
//                     padding: 1
//                 },
//             },
//
//             slider: {
//                 track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
//                 thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
//             },
//
//             // scroller: true,
//
//             space: {
//                 left: 10,
//                 right: 10,
//                 top: 10,
//                 bottom: 10,
//
//                 panel: 10,
//             }
//         })
//             .layout()
//         //.drawBounds(this.add.graphics(), 0xff0000);
//
//         // Set icon interactive
//         var print = this.add.text(0, 0, '');
//         this.input.topOnly = false;
//         var labels = [];
//
//         this.catetgories.forEach( recipeCategory =>{
//             labels.push(...this.scrollablePanel.getElement(`#${recipeCategory}.items`, true));
//         })
//
//
//         var scene = this;
//         labels.forEach (label=> {
//             if (!label) {
//                 return;
//             }
//             if(label.getElement(('icon')))
//             var click = scene.rexUI.add.click(label.getElement('icon'), { threshold: 10 })
//                 .on('click', ()=> {
//                     if (!label.getTopmostSizer().isInTouching()) {
//                         return;
//                     }
//                     let recipeLookup = label.recipeLookup;
//                     if(recipeLookup){
//                         this.clickHandler(recipeLookup);
//                     }
//                     // var category = label.getParentSizer().name;
//                     // print.text += `${category}:${label.text}\n`;
//                 });
//         })
//     }
//
//     createButton (scene, direction, text) {
//         var radius;
//         switch (direction) {
//             case 0: // Right
//                 radius = {
//                     tr: 20,
//                     br: 20
//                 }
//                 break;
//             case 2: // Left
//                 radius = {
//                     tl: 20,
//                     bl: 20
//                 }
//                 break;
//         }
//         return scene.rexUI.add.label({
//             width: 50,
//             height:40,
//             background: scene.rexUI.add.roundRectangle(0, 0, 50, 50, radius, COLOR_DARK),
//             text: scene.add.text(0, 0, text, {
//                 fontSize: '18pt'
//             }),
//             space: {
//                 left: 10
//             }
//         });
//     }
//
//     createHeader(scene, data) {
//         // var title = scene.rexUI.add.label({
//         //     orientation: 'x',
//         //     text: scene.add.text(0, 0, 'Recipes'),
//         // });
//         var header = scene.rexUI.add.label({
//             orientation: 'y',
//             icon: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 5, COLOR_LIGHT),
//             text: scene.add.text(0, 0, data.name),
//
//             space: { icon: 10 }
//         });
//
//         return scene.rexUI.add.sizer({
//             orientation: 'y',
//             space: { left: 5, right: 5, top: 5, bottom: 5, item: 10 }
//         })
//             .addBackground(
//                 scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
//             )
//             .add(header, // child
//                 { proportion: 1, expand: true }
//             );
//     };
//
//
//
//     createPanel (scene, data) {
//         var sizer = scene.rexUI.add.sizer({
//             orientation: 'x',
//             space: { item: 10 }
//         })
//         this.catetgories.forEach( recipeCategory =>{
//             sizer.add(
//                 this.createTable(scene, data, recipeCategory, 1), // child
//                 { expand: true }
//             )
//         })
//         return sizer;
//     }
//
//
//     createTable(scene, data, key, rows) {
//         var capKey = key.charAt(0).toUpperCase() + key.slice(1);
//         var title = scene.rexUI.add.label({
//             orientation: 'x',
//             text: scene.add.text(0, 0, capKey),
//         });
//
//         var items = data[key];
//         var columns = Math.ceil(items.length / rows);
//
//         var table = scene.rexUI.add.gridSizer({
//             column: columns,
//             row: 3,
//             rowProportions: 1,
//             space: { column: 50, row: 0 },
//             name: key  // Search this name to get table back
//         });
//
//         var item, r, c;
//         var iconSize = 30//(rows === 1) ? 80 : 40;
//         for (var i = 0, cnt = items.length; i < cnt; i++) {
//             item = items[i];
//             r = i % rows;
//             c = (i - r) / rows;
//             table.add(
//                 this.createRequirements(scene, item, iconSize, iconSize),
//                 c,
//                 0,
//                 'top',
//                 0,
//                 true
//             );
//             table.add(
//                 this.createIngredients(scene, item, iconSize, iconSize, key),
//                 c,
//                 1,
//                 'top',
//                 0,
//                 true
//             );
//             table.add(
//                 this.createResult(scene, item, iconSize, iconSize, i),
//
//                 c,
//                 2,
//                 'top',
//                 0,
//                 true
//             );
//         }
//
//
//
//         return scene.rexUI.add.sizer({
//             orientation: 'y',
//             space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
//         })
//             .addBackground(
//                 scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
//             )
//             .add(
//                 title, // child
//                 0, // proportion
//                 'left', // align
//                 0, // paddingConfig
//                 true // expand
//             )
//             .add(table, // child
//                 1, // proportion
//                 'center', // align
//                 0, // paddingConfig
//                 true // expand
//             );
//
//
//     }
//
//     createRequirements(scene, item, iconWidth, iconHeight) {
//
//         let text =  item.recipe.skill + ":" + item.recipe.level;
//         var label = scene.rexUI.add.label({
//             orientation: 'y',
//             icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_DARK),
//             text: scene.add.text(0, 0, text),
//
//             space: { icon: 3 }
//         });
//         return label;
//     };
//
//     createIngredients(scene, item, iconWidth, iconHeight, key) {
//         let text = ""
//
//
//
//         items = item.recipe.items;
//         let rows = items.length
//
//         var table = scene.rexUI.add.gridSizer({
//             column: 1,
//             row: items.length,
//             rowProportions: 1,
//             space: { column: 0, row: 0 },
//             name: "ingredients" + key  // Search this name to get table back
//         });
//
//         var item, r, c;
//         var iconSize = 30//(rows === 1) ? 80 : 40;
//         for (var i = 0, cnt = items.length; i < cnt; i++) {
//             item = items[i];
//             text = `${item.item.id} x ${item.amount}\n`
//             r = i % rows;
//             c = (i - r) / rows;
//             var label = scene.rexUI.add.label({
//                 orientation: 'y',
//                 icon: scene.add.sprite(0,0,item.item.inventoryIcon),
//                 text: scene.add.text(0, 0, text),
//
//                 space: { icon: 3 }
//             });
//
//
//             table.add(
//                 label,
//                 c,
//                 r,
//                 'top',
//                 0,
//                 true
//             );
//         }
//
//
//
//         //
//         items = item.recipe.items;
//         // items.forEach(item=>{
//         //     console.log(item);
//         //
//         // })
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         //
//         // var label = scene.rexUI.add.label({
//         //     orientation: 'y',
//         //     icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_DARK),
//         //     text: scene.add.text(0, 0, text),
//         //
//         //     space: { icon: 3 }
//         // });
//         return table;
//
//
//
//
//
//
//
//
//
//
//
//
//
//     };
//
//     createResult(scene, item, iconWidth, iconHeight, id) {
//         var label = scene.rexUI.add.label({
//             orientation: 'y',
//             icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_LIGHT),
//             text: scene.add.text(0, 0, item.name),
//             space: { icon: 3 }
//         });
//         label.recipeLookup = {skill: item.recipe.skill, key: id}
//         return label;
//     };
//
//     set hide(val){
//         this.inventory.hide = val;
//     }
//     set recipes(val) {
//         this.currentRecipes = val;
//         this.buildDataFromRecipes();
//
//
//     }
//
//
//
//
//
//     clickHandler(lookup){
//         this.sender.craftRecipe(lookup);
//     }
//
//
//
//     get recipes(){
//       //  return this.recipesShowing;
//     }
//
// }
//
