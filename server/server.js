const PORT = 55000;


const server = require('http').createServer();
const items = require('./items.js'); //consider converting
const zoneManager = require('./zone-manager.js')

global.io = require('socket.io')(server);
io = global.io;




players = {
    0:{
        base:"basecharacter",
        paperDoll:{
            HEAD: items.data.goldhelm,
            BODY: items.data.jacket,
            WEAPON: undefined,
            OFFHAND: undefined,
            LEGS: items.data.goldlegs,
            BOOTS: undefined
        }
    }
};







let firstZone = new zoneManager.Zone();
io.on('connect', function(client) {
    firstZone.join(client);

    client.on('stop',function() {
        client.player.stop();
    });

    client.on('move',function(data) {
        console.log(rm.roomManager.rooms);
        client.player.addMovement({x:data.x, y:data.y});
    });

    client.on('disconnect', function(){
   //.     systems.removeFromUpdater(client.player.updaterID);
   //     client.player = undefined;
    });

});



server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

