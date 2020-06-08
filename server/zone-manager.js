const zoneSender = require('./zone-sender.js')
const systems = require('./systems.js');
const gameObjects = require('./game-object-factory.js');
const mapBuilder = require('./map-builder.js')
const dropManager = require('./drop-manager.js');
const shopInventory = require('./shop-inventory.js')
systems.startUpdate();




// move physics world into a seperate class after reducing coupling
class ItemWorld{
    constructor(sender) {
        this.sender = sender;
        this.floorItems = {};
        this.lastItemId = 0;
    }

    addItem(pos,item){
        let itemPos = this.lastItemId;

        let newItem = JSON.parse(JSON.stringify(item));
        newItem.pos = JSON.parse(JSON.stringify(pos));
        this.floorItems[itemPos] = newItem;

        this.lastItemId++
        this.sender.notifyNewItem(itemPos, newItem);
    }

    removeItem(id){
        let item = this.floorItems[id];
        this.sender.notifyItemRemove(id);
        delete this.floorItems[id];
        return item;
    }

    canPickup(id,position){
        let item = this.floorItems[id];
        if(item){
            let itemDistance = distance(item.pos, position);
            if(itemDistance < 50) return item;

        }

    }
}

// receive mapped map!
class Zone{
    constructor(zoneid) {
        this.zoneSender = new zoneSender.ZoneSender(zoneid);
        this.physicsWorld = new PhysicsWorld(this.zoneSender);
        this.itemWorld = new ItemWorld(this.zoneSender,this.physicsWorld);
        this.zoneID = zoneid;
        this.factory = new gameObjects.Factory(this.physicsWorld.collisionManager, this.itemWorld);
        mapBuilder.build(this.factory, this.zoneID,  this.physicsWorld); // more concrete management of nodes, will remove physics world from this
        systems.addToUpdate(this);
        this.testCreateMobLots(5);
        this.testCreateShopKeeper();
    }

    testCreateShopKeeper() {
        this.shops = {};

        // temp
        let config = {
            position: {x: 150, y: 150},
            zone: this.zoneID
        }

        let entityConfig = {
            type: entityTypeLookup.SHOPKEEPER,
            config: config
        }


        let newMob = this.factory.new(entityConfig);
        this.physicsWorld.addNewMob(newMob);
        this.shops[this.physicsWorld.lastEntityId - 1] =  new shopInventory.ShopInventory(0); //temp
    }


    sellItem(client, shopid, slot){

        // temp do this in inventories
        //todo: check range
        let shop = this.shops[shopid];
        shop.sell(slot, client.character.invent);
    }


    buyItem(client, shopid, slot){
        //todo: check range
        let shopInv = this.shops[shopid];
        if(shopInv);
        shopInv.buy(slot, client.character.invent);
    }
    //
    // shopTrade(client, id){
    //     // let shops = this.shops[id];
    //     // if(shops){
    //     //     let interactReturn = shops.interact();
    //     //     let clientId = client.character._id;
    //     //     let location = client.playerLocation;
    //     //     serverSender.clientMessage(interactReturn.hook, interactReturn.data, location, clientId)
    //     // }
    // }


// todo: move to mob factor, promote more stats/ai configuration
//       spawn from zones added to map use A*
    testCreateMobLots(times){
        for(let i = 0; i < times; i++){


            let callBack = (pos)=>{
                this.itemWorld.addItem(pos,dropManager.roleDrop(0));
                let timedcallback = setTimeout(() => {
                    this.testCreateMobLots(1);
                    clearTimeout(timedcallback);
                }, 2000);
            }

            let config = {
                deathCallback: callBack,
                stats:{health: 100, maxHealth:100, defence:0, attack:2, speed:3 },
                zone: this.zoneID
            }

            let entityConfig = {
                type: entityTypeLookup.PIG,
                config: config
            }


            let newMob = this.factory.new(entityConfig);
            this.physicsWorld.addNewMob(newMob);
        }
    }

    triggerEntityReload(key){
       let entity = this.physicsWorld.entities[key];
       this.zoneSender.notifyEntityReload(entity, key);
    }



    join(clientID, playerLocation, previousZoneID, client, newPosition){
        if(previousZoneID != undefined){
            let previousZone = ZONES[previousZoneID];
            client = previousZone.leave(clientID);
            playerLocation.pos = Object.assign({}, newPosition);
        }
        this.zoneSender.subscribe(client);
        this.addPlayerCharacter(client, playerLocation);
    }

    leave(clientID){
        let client = this.zoneSender.room.clientLookup[clientID];
        this.zoneSender.notifyEntityRemove(client.player.config.key);
        this.zoneSender.unsubscribe(client);
        this.physicsWorld.removeEntity(client.player.config.key);
        return client;
    }

    pickup(client, id){

        let item = this.itemWorld.canPickup(id, client.player.pos);
        if(!item) return;

        let hasPickedUp =  client.character.invent.pickupItem(item);
        if(hasPickedUp){
            this.itemWorld.removeItem(id);
            client.emit("myInventory",client.character.invent.message);
        }
    }

    addPlayerCharacter(client){

        // respawn player with max health at zone spawn when they diea
        // TODO: add a global respawn point in town or something
        let deathCallback  = () =>{
            client.playerLocation.pos = Object.assign({}, SPAWNS[this.zoneID]);
            this.addPlayerCharacter(client);
        };

        let playerConfig = {
            inventory: client.character.invent,
            appearance: client.character.appearance,
            paperDoll: client.character.invent.paperDoll,
            key: client.character._id,
            stats: client.playerStats,
            location: client.playerLocation,
            _id: client.character._id,
            deathCallback: deathCallback //temp
        }


        let entityConfig = {
            type: entityTypeLookup.PLAYER,
            config:playerConfig
        }

        let newPlayer = this.factory.new(entityConfig);


        this.physicsWorld.addPlayerCharacter(newPlayer, client.character._id)
        client.playerLocation.zone = this.zoneID;
        client.player = newPlayer;

        this.zoneSender.notifyClientPlayer(client, newPlayer);
        this.zoneSender.initMessage(client, this.physicsWorld.entities, this.itemWorld.floorItems, this.shops);
    }

    update() {
        this.physicsWorld.update();
        Object.keys(this.shops).forEach((shopKey) => {
            let shop = this.shops[shopKey];
            shop.update();
        })
    }
}



class PhysicsWorld{

    constructor(sender){
        this.sender = sender;
        this.collisionManager = new systems.CollisionManager();
        this.entities = {};
        this.lastEntityId = 0;
    }

    update(){
        let entityKeys = Object.keys(this.entities);
        entityKeys.forEach( (key)=> {
            let entity = this.entities[key];

            if(entity.isDelete){
                this.removeEntity(key);
            }else{
                entity.update();
                this.sender.notifyEntityUpdate(entity, key); //temp
            }

        });
        this.collisionManager.update();
    }


    addPlayerCharacter(entity, key){
        this.entities[key] = entity;
        return entity;
    }

    addNewMob(mob){
        this.entities[this.lastEntityId] = mob;
        this.sender.notifyNewEntity(mob, this.lastEntityId);
        this.lastEntityId++
    }

    removeEntity(id){
        let entity = this.entities[id];
        if(entity){
            this.sender.notifyEntityRemove(id);
            delete this.entities[id];
        }
    }

}


module.exports = {Zone};