const fs = require('fs');
const shopInventory = require('./shop-inventory.js')

function getZoneData(zone){
    let file = ZONEMAPS[zone];
    let rawdata = fs.readFileSync('./tilemaps/'+ file);
    let tilemap = JSON.parse(rawdata);
    return tilemap;
}


ZONEMAPS= {0:"zone1.json",1:"zone2.json", 2:"zone3.json"}

SPAWNS= {0:{x:150,y:150},1:{x:400,y:400}, 2:{x:600,y:400}} //temp


nodeLookup = {
    "rock_iron":{
        "drop": "rock_iron_1",
        "reward": {"type": skillLevels.MINING, "amount":15}

    },
    "rock_gold":{
        "drop": "rock_gold_1",
        "reward": {"type": skillLevels.MINING, "amount":55}

    },
    "rock_copper":{
        "drop": "rock_copper_1",
        "reward": {"type": skillLevels.MINING, "amount":25}

    },
    "wood_magic":{
        "drop": "wood_magic_1",
        "reward": {"type": skillLevels.WOODCUTTING, "amount":15}
    }
}



function getWorldObjects(id){
    let worldData = getZoneData(id);
    let worldObjects = [];
    worldData.forEach(function(layer){
        layer.objects.forEach(function(object){
            let newObject = {
                width:object.width,
                height:object.height,
                pos: {x: object.x,y:object.y},
                type:object.type,
            }
            ////// TEMP /////
            let newzone = getProperty(object.properties, "zone");
            if(newzone !== undefined) newObject.zone = newzone;

            let xpos = getProperty(object.properties, "x");
            if(xpos !== undefined) newObject.x = xpos;

            let ypos = getProperty(object.properties, "y");
            if(ypos !== undefined) newObject.y = ypos;

            let id = getProperty(object.properties, "node_id");
            if(id !== undefined) newObject.node_id = id;

            let benchType = getProperty(object.properties, "bench_type");
            if(benchType !== undefined) newObject.bench_type = benchType;

            let shopID = getProperty(object.properties, "shop_id");
            if(shopID !== undefined) newObject.shop_id = shopID;


            worldObjects.push(newObject);
        });
    })
    return worldObjects;
}


function AABBtoBounds(obj){
    let x = obj.pos.x,
        y = obj.pos.y,
        width = obj.width,
        height = obj.height
    ptl = {x:x - (width/2), y:y - (height/2)};
    ptr = {x:x + (width/2), y:y - (height/2)};
    pbr = {x:x + (width/2), y:y + (height/2)};
    pbl = {x:x - (width/2), y:y + (height/2)};
    let points = [ptl,ptr,pbr,pbl];
    console.log(points);
    return points;
}


function getProperty(properties, prop){
    let value = undefined
    if(!properties) return value;
    properties.forEach(function (property) {
        if(prop === property.name){
            value =  property.value;
        }
    })
    return value;
}


function build(factory, zone, physicsWorld){
    let worldObjects = getWorldObjects(zone.zoneID);
    createFromJSON(worldObjects, factory, zone, physicsWorld);
}

function createFromJSON(objects, factory, zone, phyWorld){

    let navMesh = [];
    objects.forEach((object)=>{

        let x = object.pos.x + object.width /2;//temp
        let y = object.pos.y + object.height /2;
        let correctPos = {x:x,y:y};

        let config = {
            pos:correctPos,
            width:object.width,
            height:object.height,
        }



        switch(object.type){
            case "NONPASSIBLE":
                let npConfig = {
                    config: config,
                    type:entityTypeLookup.NONPASSIBLE
                }
                factory.new(npConfig);
                break;

            case "TRIGGER_ZONE_CHANGE":
                config.zoneTarget =  object.zone;
                config.posTarget =  {x: object.x, y: object.y};
                let tConfig = {
                    config: config,
                    type:entityTypeLookup.TRIGGER_ZONE_CHANGE
                }
                factory.new(tConfig);

                break;
            case "NODE":
                let lookup = nodeLookup[object.node_id];

                config.layers = {base: "rock"};
                config.stats = { health: 100, maxHealth:100, defence:5};
                config.drop = lookup.drop;
                config.zone = zone.zoneID;
                config.reward = lookup.reward;

                let nConfig = {
                    type:entityTypeLookup.BASENODE,
                    config:config
                }

                let node = factory.new(nConfig);
                phyWorld.addNewMob(node); // temp
                break;

            case "WORKBENCH":
                let wLookup = workBenches[object.bench_type]

                config.zone = zone.zoneID;
                config.type = wLookup.type; // used for appearance
                config.recipes = wLookup.recipes

                let bentityConfig = {
                    type: entityTypeLookup.WORKBENCH,
                    config: config
                }

                let wBench = factory.new(bentityConfig);
                zone.addWorkBench(wBench);
                break;
            case "SHOPKEEPER":
                let shopInv = new shopInventory.ShopInventory(object.shop_id)
                config.zone = zone.zoneID
                let shEntityConfig = {
                    type: entityTypeLookup.SHOPKEEPER,
                    config: config
                }

                let shopEntity = factory.new(shEntityConfig);
                zone.addToShops(shopInv, shopEntity);
                break;
            case "MOB-ZONE":
                let bounds = AABBtoBounds(config);
                navMesh.push(bounds);
                break;
        }

    })
    zone.navMesh = navMesh;
}


module.exports = {build}