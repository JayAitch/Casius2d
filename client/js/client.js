const cip = host_config.cip;
const csocket = host_config.csocket;


class GameClient{
    constructor(scene, socket){
        this.socket = socket
        this.gameScene = scene;
        this.receiver = new Receiver(this.gameScene, this.socket);
        this.sender = new Sender(this.socket);
    }
}


class Receiver{
    constructor(gameScene, socket){
        this.gameScene = gameScene;
        this.socket = socket;
        this.createListeners();
    }

    createListeners(){
        this.socket.on('newEntity',(data)=>{
            this.gameScene.newEntity(data.id, data.x, data.y, data.facing, data.state, data.base, data.layers, data.health, data.mHealth);
        });
        this.socket.on('moveEntity',(data)=>{
            // poentially seperate mesasge
            this.gameScene.moveEntity(data.id, data.x, data.y, data.facing, data.state,  data.health, data.mHealth);
        });

        this.socket.on('loadMap', (data)=> {
            this.gameScene.loadMap(data.id);
        });

        this.socket.on('myPlayer', (data)=> {
            this.gameScene.loadPlayerData(data.id);
        });


        this.socket.on('myInventory',(data)=>{
            this.gameScene.loadInventory(data);
        });


        this.socket.on('entityList', (data)=>{
            // health is always blank here
            let keyList = Object.keys(data);
            keyList.forEach((key)=>{
                let dataRow = data[key];
                this.gameScene.newEntity(dataRow.position, dataRow.x, dataRow.y, dataRow.facing, dataRow.state, dataRow.base, dataRow.layers, data.health, data.mHealth);
            })
        });

        this.socket.on('removeItem', (data)=>{
            console.log(data);
            this.gameScene.removeItem(data.id);
        });


        this.socket.on('newItem', (data)=>{
            this.gameScene.newItem(data.key,data.id, data.pos);
        });

        this.socket.on('itemList', (data)=>{
            let keylist = Object.keys(data);
            keylist.forEach((key)=>{
                let dataRow = data[key];
                this.gameScene.newItem(key,dataRow.id, dataRow.pos);
            })

        });


        this.socket.on('removeEntity',(data)=>{
            this.gameScene.removeEntity(data.id);
        });
    }
}


class LoginClient{
    constructor(scene, ip, socket){
        this.socket = io(`http://${ip}:${socket}`);
        this.menuScene = scene;
        this.sender = new Sender(this.socket);

        this.socket.on('loggedIn', (data)=>{
            this.menuScene.loggedIn(data);
        });
    }
}


class Sender{
    constructor(socket){
        this.socket = socket;
    }
    connect(){
        this.socket.emit('connect');
    }
    move(direction) {
        this.socket.emit('move', direction);
    }
    attack() {
        this.socket.emit('attack');
    }
    joinZone(zone){
        this.socket.emit('joinzone', zone);
    }
    stop(){
        this.socket.emit('stop');
    }
    login(username, password){
        this.socket.emit('login', username, password);
    }
    createAccount(username, password){
        this.socket.emit('createaccount', username, password);
    }
    pickupItem(id){
        this.socket.emit('pickup', id);
    }
}



// Client = {
//     listenersSet: false,
//     start: function(ip, socket){
//         Client.socket = io('http://' + ip + ":" + socket);
//         this.setListeners();
//
//     },
//     sendMove: function (direction){
//         Client.socket.emit('move', {direction:direction});
//     },
//     sendChangeCharacter: function(characterID){
//         Client.socket.emit("changecharacter", {character: characterID});
//     },
//     askGameConnect:  function(){
//         Client.socket.emit('gameconnect');
//     },
//     sendStopMove: function () {
//         Client.socket.emit('stopmove');
//     },
//     askJoinLobby: function(){
//         Client.socket.emit('joinlobby');
//         // extend this by passing in lobby id or something
//     },
//     memberReadyToggle: function(){
//         Client.socket.emit('playerreadytoggle');
//     },
//     setListeners:function(){
//         if(this.listenersSet === true) return;
//         this.listenersSet = true;
//
//         Client.socket.on('newplayer',function(data){
//             gameClient.addNewPlayer(data.id, data.characterID, data.x, data.y);
//         });
//
//         Client.socket.on('collisionplayer',function(data){
//             gameClient.onCollisionPlayerBall(data.ball, data.player);
//         });
//
//         Client.socket.on('initgame',function(data){
//             let players = data.players;
//             let balls = data.balls;
//
//             for(let key in players){
//                 let player = players[key];
//                 gameClient.addNewPlayer(player.id, player.characterID,player.x ,player.y);
//             }
//             for(let key in balls){
//                 let ball = balls[key];
//                 gameClient.addNewBall(key, ball.x, ball.y);
//             }
//         });
//
//         Client.socket.on('move',function(data){
//             gameClient.movePlayer(data.id,data.x,data.y);
//         });
//
//         Client.socket.on('remove',function(id){
//             gameClient.removePlayer(id);
//         });
//
//         Client.socket.on('goalscored',function(data){
//             gameClient.goalScored(data.id);
//         });
//
//         Client.socket.on('playerdeath',function(data){
//             gameClient.playerDeath(data.id);
//         });
//
//         Client.socket.on('powerupcollected',function(){
//             gameClient.powerUpCollected();
//         });
//
//         Client.socket.on('endgame',function(data){
//             gameClient.endGame(data.id);
//         });
//         Client.socket.on('newball',function(data){
//             gameClient.addNewBall(data.key, data.x,data.y);
//         });
//
//
//         Client.socket.on('moveball',function(data){
//             gameClient.moveBall(data.key, data.x, data.y);
//         });
//
//         Client.socket.on('loadgame',function(data){
//             lobbyClient.triggerGame();
//         });
//
//
//         Client.socket.on('newmember',function(data){
//             lobbyClient.newLobbyMember(data.position, data.isReady, data.character);
//         });
//
//         Client.socket.on('playerready', function(data){
//             lobbyClient.memberReadied(data.position, data.isReady);
//         });
//
//         Client.socket.on('characterchange', function (data) {
//             lobbyClient.changeLobbyCharacter(data.position, data.character);
//         });
//
//         Client.socket.on('memberleft', function(data){
//             lobbyClient.memberLeft(data.position);
//         });
//
//
//         Client.socket.on('spawnpowerup', function(data){
//             gameClient.spawnPowerUp(data.x,data.y);
//         });
//
//
//         // this could target a specific lobby?
//         Client.socket.on('alllobbymembers',function (data) {
//             console.log('alllobbymemebrs');
//             for(let key in data){
//                 let member = data[key];
//                 lobbyClient.newLobbyMember(key, member.isReady, member.character, member.position);
//             }
//         });
//
//     }
// };
//
// const lobbyClient = {
//     setScene: function(scene){
//         this.scene = scene;
//         Client.askJoinLobby();
//     },
//     triggerGame: function(){
//         this.scene.triggerGameLoad();
//     },
//     changeLobbyCharacter: function(position,character) {
//         this.scene.changeLobbyCharacter(position,character);
//     },
//     memberReadied: function(position, isReady, ){
//         this.scene.lobbyMemberReadied(position,isReady);
//     },
//     newLobbyMember: function(pos, isReady, character)  {
//         this.scene.newLobbyMember(pos, isReady, character);
//     },
//     memberLeft: function (pos) {
//         this.scene.removeLobbyMember(pos);
//     }
// };
//
//
// const gameClient =  {
//     setScene: function(scene){
//         this.scene = scene;
//         console.log(scene);
//         Client.askGameConnect();
//     },
//
//     addNewPlayer: function(id, character, x, y){
//         console.log(character);
//         this.scene.addNewPlayer(id, character, x, y);
//     },
//
//     movePlayer: function(id,x,y){
//         this.scene.movePlayer(id, x, y);
//     },
//
//     goalScored: function(id){
//         this.scene.goalScored(id);
//     },
//     powerUpCollected: function(){
//       this.scene.collectPowerUp();
//     },
//
//     playerDeath: function(id){
//         this.scene.killPlayer(id);
//     },
//
//     endGame: function(winnerId){
//         this.scene.endGame(winnerId);
//     },
//
//     addNewBall: function(key, x, y){
//         this.scene.spawnBall(key, x, y);
//     },
//     moveBall: function(key, x, y){
//         this.scene.moveBall(key, x, y);
//     },
//
//     onCollisionPlayerBall: function(ball, player){
//         this.scene.onCollisionPlayerBall(ball, player);
//     },
//     spawnPowerUp: function(x,y){
//         this.scene.spawnPowerUp(x,y);
//         console.log("spawning powerup");
//         console.log(`${x},${y}`);
//     }
// };
//
//
//
