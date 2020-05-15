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
    }, 24);
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
        this.colliders = [];
    }

    addCollision(a, b, callback) {
        let collisionObject = {};
        collisionObject.objA = a;
        collisionObject.objB = b;
        collisionObject.onCollision = callback;
        this.colliders.push(collisionObject);
    }

    update() {
        this.colliders.forEach((obj) => {
            if (this.collides(obj.objA, obj.objB)) {
                if((obj.objA.isActive && obj.objB.isActive)) obj.onCollision();
            }
        })
    }

    scane
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