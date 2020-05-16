const mysql  = require('mysql');

const con = mysql.createPool({
              connectionLimit: 10,
              host: "localhost",
              user: "admin",
              password: "652910802!*Rr"
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
    
    createAccount: function(username,password,callBack){
        
        this.doesAccountExist(username,function(isAccountExists){
            
            if(isAccountExists){
                let statement = "INSERT INTO mydb.main_user_login(username,password) VALUES(?,?);";      
                con.query(statement,[username,password],function (err, result) {if (err) throw err;});
                callBack(true)
            }else{
                callBack(false)
            }          
        })

    },

    
    requestLogin: function(username,password,callBack){
        let statement = "SELECT id AS identifier,username FROM mydb.main_user_login WHERE username=? AND password =?;"
        
        con.query(statement,[username,password], function (err, result) {
            if (err) throw err;
            callBack(result[0] != undefined)
        });       
    },
    
    doesAccountExist: function(username,callback){
        let statement = "SELECT id AS identifier,username AS username FROM mydb.main_user_login WHERE username=?;"
 
        con.query(statement,[username],  (err, result) => {
            if (err) throw err;
            callback(result[0] == undefined);          
        });
    }
};


module.exports = {databaseConnection};

