const mysql  = require('mysql');
const config = require('../config/configs.js');

const con = mysql.createPool({
              connectionLimit: 10,
              host: config.db_config.host,
              user: config.db_config.user,
             password: config.db_config.pw
});


const databaseConnection = {
    isLoginValidationOn: true,
    testConnect: function(){
      
      con.query("select * from mydb.MAIN_CHARACTER;", function (err, result) {

      if (err) throw err;
        console.log("DB Connected!");
        console.log("Result: " + result);
      });
    },



    // Creates an account when none has been found with the supplied username
    createAccount: function(username,password){
        return new Promise((resolve,reject)=> {
            return this.doesAccountExist(username).then((doesExist) => {

                if (!doesExist){
                    let statement = "INSERT INTO mydb.main_user_login(username,password) VALUES(?,?);";
                    con.query(statement, [username, password], function (err, result) {
                        if (err) throw err;
                        return resolve(result[0]);
                    });
                }else{

                }
                return resolve(doesExist);

            }).catch((err) => {
                console.log(err);
            })
        });
    },

    // Inserts into the character table if there is no character with this name
    createOrReturnCharacter: function(name,zoneId,xPosition,yPosition){
        return new Promise((resolve,reject)=> {

            return this.getCharacter(name).then((character) => {

                let mCharacter = character;
                if(!mCharacter){
                    mCharacter =  this.createNewCharacter(name,zoneId,xPosition,yPosition).then((character) => {
                        return character;
                    })
                }
                return resolve(mCharacter);
            }).catch((err) => {
                console.log(err);
            });
        });
    },

    createNewCharacter: function(name,zoneId,xPosition,yPosition){
        return new Promise((resolve, reject) => {
            console.log("creating character");
            let statement = "INSERT INTO mydb.main_character(name,zone_id,x_position,y_position) VALUES(?,?,?,?);";
            con.query(statement, [name, zoneId, xPosition, yPosition], function (err, result) {
                return resolve(result);
            });
        });
    },


    requestLogin: function(username,password){
        return new Promise((resolve,reject)=> {
            let statement = "SELECT id AS identifier,username FROM mydb.main_user_login WHERE username=? AND password =?;"
            con.query(statement, [username, password], (err, result) => {
                if (err) throw err;
                return err ? reject(err) : resolve(result[0]);
            })
        });
    },


    // Returns true if an account exists with the usernamer 'username'
    doesAccountExist: function(username){
        let statement = "SELECT id AS identifier,username AS username FROM mydb.main_user_login WHERE username=?;"
        return new Promise((resolve,reject)=> {
            con.query(statement, [username], (err, result) => {
                if (err) throw err;
                return err ? reject(err) : resolve(( result[0]!== undefined));
            })
        });
    },


    // Returns character exists with the name 'name'
    getCharacter: function(name){
        let statement = "SELECT * FROM mydb.main_character WHERE name=?;"
        return new Promise((resolve,reject)=> {
            con.query(statement,[name],  (err, result) => {
            if (err) throw err;
            // if(result[0] !== undefined)
                return resolve(result[0]);
             });
        });

    }


};


module.exports = {databaseConnection};

