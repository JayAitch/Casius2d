const mysqlx = require('@mysql/xdevapi');
const dotenv = require('dotenv').config({path: '../config/config.env'});

const user_collection = 'user';
const character_collection = 'character';

const document_schema = 'documentdb';

const credentials_con = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_X_PROTOCOL_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

const pooling_con = {
    pooling: {
        enabled: process.env.DB_POOLING_ENABLED == 'true',
        maxIdleTime: parseInt(process.env.DB_POOLING_MAX_IDLE_TIME),
        queueTimeout: parseInt(process.env.DB_POOLING_QUEUE_TIMEOUT),
        maxSize: parseInt(process.env.DB_POOLING_QUEUE_TIMEOUT)
    }
};

const client = mysqlx.getClient(credentials_con,pooling_con);

const databaseConnection = {

    establishSession: function() {
        return new Promise((resolve) => {
            client
                .getSession()
                .then(function(session) {
                    console.log("Session taken from the pool");
                    // Create required collections
                    session.getSchema(document_schema).createCollection(user_collection,{ReuseExistingObject: true}); 
                    session.getSchema(document_schema).createCollection(character_collection,{ReuseExistingObject: true}); 

                    return resolve(session.getSchema(document_schema),true)
                })
                .catch(function(err) {
                    console.log(err)
                    return resolve(undefined,false)
                })
        })
    },

    createAccount: function(username, login) {
        console.log(login)
        return new Promise((resolve) => {
            this.establishSession().then(function(session) {
                var col = session.getCollection(user_collection);
                col
                    .add({
                        _id: username,
                        password: login
                    })
                    .execute()
                    .catch(function(err) {
                        // Unable to create account
                        console.log(err);
                        return resolve(false);
                    })
                    .then(function(){
                        // Able to create account
                        return resolve(true);
                    })
                })
                .catch(function(err){
                    // Session not established
                    return resolve(false);
                })
        })
    },

    getAcccount: function(username) {
        return new Promise((resolve) => {
            this.establishSession().then(function(session) {
                var col = session.getCollection(user_collection);
                col
                    .getOne(username)
                    .then(res => {
                        // User not found return null
                        return resolve(res)
                    })
                    .catch(err =>{
                        console.log(err)
                    })
    
            })
        })
        .catch(function(err){
            // Session not established
            return resolve(undefined);
        })
    },

    checkLogin: function(username, password) {
        return new Promise((resolve) =>{
            this.establishSession().then(function(session){
                var col = session.getCollection(user_collection);
                col
                    .find('_id = :username AND password = :password')
                    .bind('username', username)
                    .bind('password', password)
                    .limit(1)
                    .execute()
                    .then(res => {
                        // If first result is undefined - rerturn false, otherwise true
                        return res.fetchOne() == undefined ? resolve(false) : resolve(true) 
                    })
                    .catch(function(err){
                        console.log(err)
                        return resolve(false)
                    })
            })
            .catch(function(err){
                // Session not established
                return resolve(false);
            })
        })
    },

    createCharacter: function(username,character) {
        return new Promise((resolve) =>{
            this.establishSession().then(function(session){
                var col = session.getCollection(character_collection);
                col
                    .add({
                        username: username,
                        character
                    })
                    .execute()
                    .catch(function(err) {
                        // Unable to create character
                        return resolve(false);
                    })
                    .then(function(){
                        // Able to create character
                        return resolve(true);
                    })
            })
        })
        .catch(function(err){
            return resolve(false)
        })
    },

    getAllCharactersForUser: function(username){
        return new Promise((resolve) => {
            this.establishSession().then(function(session){
                var col = session.getCollection(character_collection);
                col
                    .find('username = :username')
                    .bind('username',username)
                    .execute()
                    .then(res => {
                        let set = [];
                        // Generate an array of results
                        while(doc = res.fetchOne()){
                            set.push(doc)
                        };
                        // If length is 0 return undefined - otherwise return the set
                        return set.length == 0 ? resolve(undefined) : resolve(set) 
                    })
                    .catch(function(err){
                        // Error occurred
                        console.log(err);
                        return resolve(undefined);
                    })
            })
        })
    }

}

module.exports = {
    databaseConnection
};