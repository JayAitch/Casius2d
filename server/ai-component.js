monsterStates = {"IDLE":"IDLE", "AGGRESSIVE":"AGGRESSIVE", "ATTACKING":"ATTACKING"}

class AIComponent{
    constructor(pos, velocity, movementComp, attackComp, navMesh){
        this.tick = 0;
        this.pos = pos;
        this.velocity = velocity;
        this.movementComp = movementComp;
        this.attackComp = attackComp;
        this.navMesh  = navMesh;
        this.state = monsterStates.IDLE;
        this.playerCheckRate = 10
        this.targetPlayer;
        this.aggroRange = 300;
        this.attackRange = 50;
        this.attackSpeed = 15;
    }


    remove(){delete this;}

    update(entity){
        this.tick++;
        if(this.targetPlayer ) this.moveToTargetPlayer();
        switch(this.state){
            case monsterStates.IDLE:
                this.randomMove();
                this.searchForPlayer();
                break;
            case  monsterStates.AGGRESSIVE:
                this.moveToTargetPlayer();
                this.attackIfInRange();
                break;
            case monsterStates.ATTACKING:
                this.attackOnSpeed();
                break;
        }
    }

    moveToTargetPlayer(){
        let inAggroRange = this.isInAggroRange();
        if(!inAggroRange){
            this.targetPlayer = false;
            this.state = monsterStates.IDLE
            return;
        }
        let path = this.navMesh.findPath({x:Math.floor(this.pos.x), y:Math.floor(this.pos.y)}, {x:Math.floor(this.targetPlayer.x), y:Math.floor(this.targetPlayer.y)});
        this.movementComp.stop();
         if(path){
        // console.log([this.pos.x, this.pos.y], [this.targetPlayer.x, this.targetPlayer.y])

            this.doMoveTowardsPlayer(path);
         }
    }

    attackOnSpeed(){
        if(!(this.tick % this.attackSpeed)){
            this.aiAttack();
            if(!this.isInAttackRange()){
                this.state = monsterStates.AGGRESSIVE;
            }
        }
    }

    attackIfInRange(){
        if(this.isInAttackRange()){
            this.state = monsterStates.ATTACKING;
        }
    }


    searchForPlayer(){
        if(!(this.tick % this.playerCheckRate)){
            let players = this.lookForPlayer();
            if(players)
            players.forEach( player => {
                if(distance(player, this.pos) < this.aggroRange){
                    this.targetPlayer = player;
                    this.state = monsterStates.AGGRESSIVE;
                }
            })
        }
    }

    isInAggroRange(){
        if(this.targetPlayer && distance(this.targetPlayer, this.pos) < this.aggroRange){
            return true;
        };
        return false;
    }


    isInAttackRange(){
        if(this.targetPlayer && distance(this.targetPlayer, this.pos) < this.attackRange){
            return true;
        }
        return false;
    }


    remove(){
        this.isDelete = true;
        delete this;
    }

    randomMove(){
        if(!(this.tick % this.nextAction)){
            this.changeDirection();
            let velocity = {
                x: this.direction.x,
                y: this.direction.y
            }
         //   this.movementComp.stop();
        //    this.movementComp.addMovement(velocity);
        }
    }

    doMoveTowardsPlayer(points){
        let nextPos = points[1];
        console.log(nextPos);
        let direction = {};
        direction.x = nextPos.x - this.pos.x;
        direction.y = nextPos.y - this.pos.y;

        // direction.x = this.targetPlayer.x - this.pos.x;
        // direction.y = this.targetPlayer.y - this.pos.y;
        this.direction = direction;
        let velocity = {
            x: this.direction.x,
            y: this.direction.y
        }
        console.log(this.direction);
       // this.movementComp.stop();
        this.movementComp.addMovement(velocity);

    }

    lookForPlayer(){
        let results = this.attackComp.collisionManager.boxScan(this.pos, this.aggroRange,this.aggroRange, [1]);
        if(results.length){
            return results;
        }
    }

    aiAttack(){
        let attackMessage = {
            type: messageTypes.DAMAGE,
            damage: this.attackComp.stats.attack  || 0,
            rewardCB: function(){}
        }
        this.attackComp.attack(attackMessage);
    }

    changeDirection(){
        let int = randomInteger(0,3);
        this.nextAction = randomInteger(10,50);
        switch (int) {
            case 0:
                this.direction = {x:0,y:1};
                break;
            case 1:
                this.direction = {x:0,y:-1};
                break;
            case 2:
                this.direction = {x:1,y:0};
                break;
            case 3:
                this.direction = {x:-1,y:0};
                break;
        }
    }
}

module.exports = {AIComponent}