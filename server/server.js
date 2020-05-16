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
            HEAD: {
                base: items.data.goldhelm,
                plus:1
            },
            BODY: {
                base: items.data.jacket,
                plus:1
            },
            WEAPON: {
                base: items.data.spear,
                plus:6
            },
            OFFHAND: undefined,
            LEGS: {base: items.data.goldlegs,
                plus: 1
            },
            BOOTS: undefined
        }
    }
};







let firstZone = new zoneManager.Zone();
io.on('connect', function(client) {


    client.on('login',function(){

        client.emit('loggedIn');

        client.on('joinzone',function(data) {

            firstZone.join(client);

            client.on('stop',function() {
                client.player.stop();
            });

            client.on('move',function(data) {
                client.player.addMovement({x:data.x, y:data.y});
            });
        });

    });

    client.on('createaccount', function(){
        console.log("creaste account");
    });


    client.on('disconnect', function(){
        //.     systems.removeFromUpdater(client.player.updaterID);
        //     client.player = undefined;
    });

});



server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

