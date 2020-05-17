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
    createAccount: function(username,password,callBack){
        
        this.doesAccountExist(username,function(isAccountExists){
            
            if(!isAccountExists){
                let statement = "INSERT INTO mydb.main_user_login(username,password) VALUES(?,?);";      
                con.query(statement,[username,password],function (err, result) {if (err) throw err;});
                callBack(true)
            }else{
                callBack(false)
            }          
        })

    },
    
    // Inserts into the character table if there is no character with this name
    createCharacter: function(name,zoneId,xPosition,yPosition,callBack){
        
        this.doesCharacterExist(name,function(isCharacterExists){
            
            if(!    isCharacterExists){
                let statement = "INSERT INTO mydb.main_character(name,zone_id,x_position,y_position) VALUES(?,?,?,?);";      
                con.query(statement,[name,zoneId,xPosition,yPosition],function (err, result) {if (err) throw err;});
                callBack(true)
            }else{
                callBack(false)
            }          
        })

    },

    // Returns true if the pw and usrername combination can be found
    requestLogin: function(username,password,callBack){
        let statement = "SELECT id AS identifier,username FROM mydb.main_user_login WHERE username=? AND password =?;"
        
        con.query(statement,[username,password], function (err, result) {
            if (err) throw err;
            callBack(result[0] != undefined)
        });       
    },
    
    // Returns true if an account exists with the usernamer 'username'
    doesAccountExist: function(username,callback){
        let statement = "SELECT id AS identifier,username AS username FROM mydb.main_user_login WHERE username=?;"
 
        con.query(statement,[username],  (err, result) => {
            if (err) throw err;
            callback(result[0] != undefined);          
        });
    },

    // Returns false if no character exists with the name 'name'
    doesCharacterExist: function(name,callback){
        let statement = "SELECT id AS identifier FROM mydb.main_character WHERE name=?;"
 
        con.query(statement,[name],  (err, result) => {
            if (err) throw err;
            callback(result[0] != undefined);          
        });
    }


};


module.exports = {databaseConnection};

