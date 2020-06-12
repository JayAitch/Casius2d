class InventoryMenu extends Phaser.Scene {
    constructor() {
        super({key: 'inventory-menu'});
        this.actionsList = new ActionsList(this);
        this.items = [];
        this.expectedLength = 84;
    }

    init(data) {
        this.sender = data;
    }

    set hide(val){
        this.isHide = val;
        this.itemGrid.setVisible(!val);

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

    set items(val){

        this.slottedItems = val;
        if(val.length < this.expectedLength) {
            let diff = this.expectedLength - val.length;
            for(let i = 0; i < diff; i++){
                this.slottedItems.push(undefined)
            }
        }
            if(this.itemGrid)
                this.itemGrid.setItems(this.items);
    }

    get items(){
        return this.slottedItems;
    }

    set gold(val){
        if(this.itemGrid) {
            this.itemGrid.getElement('footer').getElement('text').setText("Gold:" + val);
            this.itemGrid.getElement('footer').layout();
        }
        this.currentGold = val;
    }

    create(){
        let columns = 6;
        //if(this.items.length === 0) columns = undefined;
        this.itemGrid = this.rexUI.add.gridTable({
            background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_PRIMARY, 0.3),
            x: 300,
            y:600,
            width: 450,
            height: 280,
            //
            // header: this.rexUI.add.label({
            //     width: undefined,
            //     height: 30,
            //     space: {
            //         left: 15,
            //         right: 15
            //     },
            //     background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_DARK),
            //     text: this.add.text(0, 0, 'Inventory', textStyles["menu-header"]),
            // }),
            footer: this.rexUI.add.label({
                width: undefined,
                height: 30,
                space: {
                    left: 15,
                    right: 15
                },
                background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_DARK),
                text: this.add.text(0, 0, 'GOLD:' + this.currentGold, textStyles.gold),
            }),
            table: {

                cellWidth: 78,
                cellHeight:78,
                columns: 5,
                mask: {
                    padding: 12,
                },
                interactive: true,
                reuseCellContainer: false,
            },
            expand:{
                header:false,
                footer:false
            },

            space: {
                left: 15,
                right: 15,
                top:15,
                bottom: 15,

                table: {
                   top: 10,
                   bottom: 10,
                   left: 10,
                   right: 10
                },
                header: 0,
                footer: 15,
            },
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK, 0.5),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT,0.8),
            },
            items:  this.items,
            // scroller: true,
            createCellContainerCallback: function (cell) {
                //scene.add.image(0, 0, item.id),


                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item
                if(item){
                    let icon
                    if(item)
                        icon = scene.add.image(0, 0, item.base.inventoryIcon);

                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 5).setStrokeStyle(1, COLOR_DARK, 0.5),
                        icon: icon,
                        space:{
                            left:26
                        }
                    });

                }


            }
        }).layout();



        this.popupMenu = new PopupMenu(this);
        let actionItems = [
            {
                name:"DROP",
                children:[
                    {
                        name:"ONE",
                        command:{key:"DROP", option: {amount:1}}

                    },

                    {
                        name:"ALL",
                        command:{key:"DROP", option:{amount:1}}
                    }
                ]
            },
            {
                name:"EQUIP",
                command:{key:"EQUIP"}
            }

        ]
        // let sScene = this.scene.get("shop");
        //
        // ////  temp
        // if(sScene.id) {
        //     this.items.push({
        //         name: "EQUIP",
        //         command: {key: "EQUIP"}
        //     })
        // }else{
        //     this.items.pop();
        // }
        //


        this.itemGrid.on('cell.click',  (cellContainer, cellIndex)=> {
            let actualActions = JSON.parse(JSON.stringify(actionItems));

            let sScene = this.scene.get("shop");
            if(sScene.id && !sScene.hide) {
                actualActions.push({
                    name: "SELL",
                    command: {key: "SELL"}
                })
            }


            let callback = (action)=>{
                let data ={
                    slot:cellIndex, action:action
                }
                //     temp
                if(action === "SELL") {
                    let sScene = this.scene.get("shop");
                    data.id = sScene.id;
                }
                this.sender.clickInventorySlot(data);
            }
            let pointer = this.input.activePointer

            this.popupMenu.createMenu(pointer.x,pointer.y, actualActions, callback);

        }).on('cell.over', function (button, groupName, index) {
            button.getElement('background').setFillStyle(COLOR_DARK, 0.2);
        }).on('cell.out', function (button, groupName, index) {
                button.getElement('background').setFillStyle();
            });

        this.hide = true;
    }
}



class PopupMenu{
    constructor(scene){
        this.scene = scene;
        this.menu = undefined;
    }


    createMenu(x, y,items,callback){
        if(this.menu){
            this.menu.collapse();
            this.menu = undefined;
        }
        this.menu = this.newMenu(this.scene, x,y, items,  (button) =>{
            let command = button.item.command;
            if(command) {
                callback(command.key, command.option);
                this.menu.collapse();
                this.menu = undefined;
            }
        });
    }


    newMenu(scene, x, y, items, onClick) {
        let menu = scene.rexUI.add.menu({
            x: x,
            y: y,

            items: items,
            createButtonCallback: function (item, i) {
                let label = scene.rexUI.add.label({
                    background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, COLOR_PRIMARY),
                    text: scene.add.text(0, 0, item.name,textStyles["action-text"]),
                    icon: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
                    space: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10,
                        icon: 10
                    }
                })
                label.item = item;
                return label
            },

            easeIn: {
                duration: 100,
                orientation: 'y'
            },

            easeOut: {
                duration: 100,
                orientation: 'y'
            },

            // expandEvent: 'button.over'
        });

        menu
            .on('button.over', function (button) {
                button.getElement('background').setStrokeStyle(1, 0xffffff);
            })
            .on('button.out', function (button) {
                button.getElement('background').setStrokeStyle();
            })
            .on('button.click', function (button) {
                onClick(button);
            })

        return menu;
    }
}

