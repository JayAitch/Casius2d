let updateTimeout;

function addToUpdate(obj) {
    let updaterID = Updater.addToUpdate(obj);
    return updaterID;
}

function removeFromUpdater(id){
    Updater.removeFromUpdater(id)
}

function clearUpdater() {
    Updater.clearUpdater();
}

function startUpdate() {
    update();
}

function stopUpdate() {
    updateTimeout = null;
}

function update() {
    updateTimeout = setTimeout(function() {
        Updater.update();
        update();
    }, 80);
}

const Updater = {
    updateables:[],
    lastUpdateableID: 0,
    addToUpdate: function (object) {
        this.updateables.push(object);
        return this.updateables.length -1;
    },
    // bodge for now to stop us needing to restart the server everytime
    clearUpdater: function(){
        this.updateables = [];
    },



    update: function () {
        for(let key in this.updateables){
            let object = this.updateables[key];
            object.update();
        }
    },
    removeFromUpdater: function(id){
        if(this.updateables[id])delete  this.updateables[id];
    }
}

class CollisionManager {
    constructor(){
        this.layers = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]};
        //this.layers = {0:{i:0},1:{i:0},2:{i:0},3:{i:0},4:{i:0},5:{i:0},6:{i:0},7:{i:0},8:{i:0},9:{i:0}};
    }

    addCollider(layer, obj){
   //     let inc = this.layers[layer].i;
        let inc = this.layers[layer].length;
   //     this.layers[layer].i++;
        this.layers[layer].push(obj);
     //   this.layers[layer][inc] = obj;
        return {layer:layer, position: inc}
    }
    removeCollider(colliderPosition) {

        //this.layers[colliderPosition.layer].splice(colliderPosition.position, 1);
       // delete this.layers[colliderPosition.layer][colliderPosition.position];

    }


    // update() {
    //     let layerKeys = Object.keys(this.layers);
    //     layerKeys.forEach((key)=>{
    //         // get all colliders in the layer
    //         let colliders = this.layers[key];
    //         let colKeys = Object.keys(colliders)
    //         colKeys.forEach((colKey)=>{
    //             // get all layers this collider interacts with
    //             let objA = colliders[colKey];
    //             let interacts = objA.interacts || [];
    //             interacts.forEach((layer)=>{
    //                 // go through all colliders in relivant layers
    //                 let layerColliders = this.layers[layer];
    //                 let layerKeys = Object.keys(layerColliders);
    //                 layerKeys.forEach((interactsColKey)=>{
    //
    //                     let objB = layerColliders[interactsColKey];
    //                     if(this.collides(objA, objB)){
    //                         objA.onCollision(objB);
    //                         objB.onCollision(objA);
    //                     }
    //
    //                 });
    //             })
    //
    //         });
    //     })
    //
    // }

    update() {
        let layerKeys = Object.keys(this.layers);
        layerKeys.forEach((key)=>{
            // get all colliders in the layer
            let colliders = this.layers[key];
            for(let i = 0; i < colliders.length;i++){
                // get all layers this collider interacts with
                let objA = colliders[i];
                if(objA.isDelete) {
                    colliders.splice(i,1);
                }else{
                    let interacts = objA.interacts || [];
                    interacts.forEach((layer)=>{
                        // go through all colliders in relivant layers
                        let layerColliders = this.layers[layer];
                        for(let c = 0; c < layerColliders.length;c++){

                            let objB = layerColliders[c];
                            if(this.collides(objA, objB)){
                                objA.onCollision(objB);
                                objB.onCollision(objA);
                            }

                        }
                    })
                }


            }
        })

    }

    // boxScan(position, width, height, scanLayers,colReg){
    //     let scan = {
    //         x:position.x,
    //         y:position.y,
    //         width:width,
    //         height:height
    //     }
    //     let collision = [];
    //     if(scanLayers === undefined) scanLayers = Object.keys(this.layers);
    //
    //
    //     scanLayers.forEach((key)=>{
    //         let colliders = this.layers[key];
    //         let colKeys = Object.keys(colliders);
    //         colKeys.forEach((collider)=>{
    //             if(collider.collisionRegistration !== colReg || colReg === undefined){
    //                 if (this.collides(scan, collider)) {
    //                     collision.push(collider);
    //                 }
    //             }
    //         })
    //     })
    //
    //     return collision;
    // }


    boxScan(position, width, height, scanLayers,colReg){
        let scan = {
            x:position.x,
            y:position.y,
            width:width,
            height:height
        }
        let collision = [];
        if(scanLayers === undefined) scanLayers = Object.keys(this.layers);


        scanLayers.forEach((key)=>{
            let colliders = this.layers[key];
            colliders.forEach((collider)=>{
                // this wont work now self hitting must be done throguh layer manipulation
                if(collider.collisionRegistration !== colReg || colReg === undefined){
                    
                    if (this.collides(scan, collider)) {
                        collision.push(collider);
                    }
                }
            })
        })

        return collision;
    }


    collides (a, b) {
        let aWidth = a.width / 2;
        let aHeight = a.height / 2;
        let bWidth = b.width / 2;
        let bHeight = b.height / 2;

        /*return !(
            ((a.y + aHeight) < (b.y - bHeight)) ||
            ((a.y - aHeight) > (b.y + bHeight)) ||
            ((a.x + aWidth) < (b.x - bWidth)) ||
            ((a.x - aWidth) > (b.x + bWidth))
        );*/

        return (a.x - aWidth < b.x + bWidth  &&
            a.x + aWidth > b.x - bWidth &&
            a.y - aHeight < b.y + bHeight &&
            a.y + aHeight > b.y - bHeight)
    }
}
//maybe split into 2?
module.exports = {startUpdate, stopUpdate, addToUpdate, clearUpdater, CollisionManager, removeFromUpdater};