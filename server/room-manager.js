const roomManager = {
    rooms:[],

    createRoom: function(){
        let roomLength = this.rooms.length;
        let roomName = "room" + roomLength;
        let room = new Room(roomName);
        this.rooms.push(room);
        return room;
    },

    joinRoom: function(client, roomID){
        let room = this.lobbies[roomID];
        room.join(client);
    },

    quickJoin: function(client){
        let rooms = this.rooms;

        for(let roomNum = 0; rooms.length > roomNum; roomNum++){
            let room = rooms[roomNum];
            room.join(client);
            return room;
        }

        let room = this.createRoom();
        room.join(client);
        return room;
    },

    destroyLobby: function(pos){
        delete this.lobbies[pos];
    }

};


class Room{
    constructor(roomID){
        this.id = roomID;
    }

    join(client){
        client.join(this.id);
        console.log("client joined room:" +this.id);
        this.notifyNewMember(client);
    }

    leave(client){
        client.leave(this.id, (client) =>{
            this.notifyMemberLeft(client)
        });
    }

    broadcastMessage(client, hook, data){
        if(data){
            client.broadcast.to(this.id).emit(hook, data);
        }else{
            client.broadcast.to(this.id).emit(hook);
        }
    }

    roomMessage(hook, data){
        if(data){
            global.io.sockets.in(this.id).emit(hook, data);
        }else{
            global.io.sockets.in(this.id).emit(hook);
        }
    }

    notifyMemberLeft(client){
      // this.broadcastMessage(client,'memberleft');
    }

    notifyNewMember(client){
     //   this.broadcastMessage(client,'newmember');
    }

}




module.exports = {roomManager};