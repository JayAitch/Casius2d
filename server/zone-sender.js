const roomManager = require('./room-manager.js');


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

    initMessage(client, enities, items) {
        client.emit("entityList", this.sendEntities(enities));
        client.emit("itemList", items);
        client.emit("myPlayer", {id: client.player.key});
        client.emit("myInventory", {inventory:client.character.invent.inventory,paperDoll: client.character.invent.paperDoll });
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
            base: entity.animationComponent.baseSprite ,
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