const roomManager = require('./room-manager.js');
const craftManager = require('./crafting-manager.js')

class ZoneSender{
    constructor(zoneid) {
        this.room = roomManager.roomManager.createRoom();
        this.zoneID = zoneid;
    }

    removeItem(id) {
        this.room.roomMessage('removeItem', {id:id});
    }

    notifyNewItem(key,newItem){
        this.room.roomMessage('newItem', {key:key,item:newItem});
    }

    subscribe(client){
        this.room.join(client);
        client.emit("loadMap", {id:this.zoneID});
    }

    unsubscribe(client){
        this.room.leave(client);
    }

    initMessage(client, entities, items, shops, workBenches, banks) {
        client.emit("entityList", this.sendEntities(entities));
        client.emit("itemList", items);
        client.emit("myPlayer", {id: client.player.key});
        client.emit("myInventory", client.character.invent.message);
        client.emit("shopList", this.sendShops(shops));
        client.emit("benchList", this.sendWorkBenches(workBenches));
        client.emit("bank", client.character.bank.message)
        client.emit("recipes", craftManager.recipesManager.getRecipes())
        client.emit("skills", client.playerStats.skills.skills);
        client.emit("banks", banks)
        ////// TEMP  ////
        this.testSetUpdateShops(shops);
    }
    ////// TEMP  ////
    testSetUpdateShops(shops){
        if(!this.shopUpdate)
            this.shopUpdate = setInterval(()=>{
            this.room.roomMessage("shopList", this.sendShops(shops));
        }, 1000)
    }

    sendWorkBenches(benches) {
        let tempBench = {};
        let benchKeys = Object.keys(benches);
        benchKeys.forEach( (key)=> {
            let bench = benches[key];

            tempBench[key] = {
                position:bench.pos,
                type:bench.type,
                recipes:bench.recipes
            };
        });

        return tempBench;
    }


    sendShops(shops) {
        let tempShops = {};
        let entityKeys = Object.keys(shops);
        entityKeys.forEach( (key)=> {
            let shop = shops[key];
            tempShops[key] = {
                position:key,
                stock:shop.stock
            };
        });
        return tempShops;
    }

    sendEntities(entites) {
        let tempEntities = {};
        let entityKeys = Object.keys(entites);
        entityKeys.forEach( (key)=> {

            let entity = entites[key];
            tempEntities[key] = {
                position:key,
                x:entity.pos.x,
                y:entity.pos.y,
                facing: entity.direction,
                state:entity.state,
                base: entity.animationComponent.baseSprite,
                layers: entity.animationComponent.spriteLayers ,
                health: entity.health,
                mHealth: entity.maxHealth
            };
        });

        return tempEntities;
    }

    notifyNewEntity(entity, key){
        // todo: conver to entity.initmessage
        this.room.roomMessage('newEntity', {
            id:key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            base: entity.animationComponent.baseSprite,
            layers: entity.animationComponent.spriteLayers,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

    notifyEntityUpdate(entity, key){
        // todo: conver to entity.updatemessage
        this.room.roomMessage('moveEntity', {
            id: key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

    notifyEntityReload(entity, key){
        // todo: conver to entity.reloadmessage
        this.room.roomMessage('reloadEntity', {
            id: key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            base: entity.animationComponent.baseSprite ,
            layers: entity.animationComponent.spriteLayers,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }


    notifyEntityRemove(entityPos){
        this.room.roomMessage('removeEntity', {
            id:entityPos
        })
    }

    notifyItemRemove(id){
        this.room.roomMessage('removeItem', {id:id})
    }

    notifyClientPlayer(client, entity){
        // todo: conver to entity.message
        this.room.broadcastMessage(client,'newEntity', {
            id:entity.key,
            x:entity.pos.x,
            y:entity.pos.y,
            facing: entity.direction,
            state:entity.state,
            base: entity.animationComponent.baseSprite,
            layers: entity.animationComponent.spriteLayers,
            health: entity.health,
            mHealth: entity.maxHealth
        })
    }

}

module.exports = {ZoneSender};