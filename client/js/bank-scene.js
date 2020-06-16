class BankMenu extends Phaser.Scene {
    constructor() {
        super({key: 'bank-menu'});
        this.actionsList = new ActionsList(this);
        this.items = [];
        this.expectedLength = 448;
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
            x: 500,
            y: 300,
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
                name:"WITHDRAW",
                children:[
                    {
                        name:"ONE",
                        command:{key:"WITHDRAW", option: {amount:1}}

                    },

                    {
                        name:"ALL",
                        command:{key:"WITHDRAW", option:{amount:1}}
                    }
                ]
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



            let callback = (action)=>{
                let data ={
                    slot:cellIndex, action:action
                }
                this.sender.clickBankSlot(data);
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


