'use strict';

const mysql = require('mysql2/promise');
const config = require('./config');



let sqlPromise = null;

async function init() {
  if (sqlPromise) return sqlPromise;

  sqlPromise = await newConnection();
  return sqlPromise;
}

//internal function to connect to databse
async function newConnection() {
  const sql = await mysql.createConnection(config.database);

  sql.on('error', (err) => {
    console.error(err);
    sql.end();
  });

  return sql;
}

//internal function on end a Connection
async function releaseConnection(connection) {
  await connection.end();
}

async function shutDown() {
  if (!sqlPromise) return;
  const stashed = sqlPromise;
  sqlPromise = null;
  await releaseConnection(await stashed);
}

module.exports.findOrAdd = async function(user){
    const sql = await init();

    let query = 'SELECT * from Lecturers where email = ?';
    let result = await sql.query(sql.format(query,user.emails[0].value));

    if(result[0].length == 0){
        console.log("Adding user to database")
        return(addUser(user));
    }else{
        console.log("User found")
        return(user)
    }
}




async function addUser(user){
    const sql = await init();

    const values = [user.name.givenName, user.name.familyName, user.emails[0].value];
    const columns = ["fName","lName","email"] ;

    let query = 'INSERT into Lecturers(??) values (?)';
    let result = await sql.query(query,[columns,values]);

    return(result);
}
