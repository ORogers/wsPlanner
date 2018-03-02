'use strict';

const mysql = require('mysql2/promise');
const config = require('./config');



let sqlPromise = null;

async function init() {
  if (sqlPromise) return sqlPromise;

  sqlPromise = newConnection();
  return sqlPromise;
}

//internal function to connect to databse
async function newConnection() {
  const sql = await mysql.createConnection(config.databse);

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

module.exports.addUser = async function addUser(user){
    const sql = await init();
    let data = [user.name.givenName,
                user.name.givenName,
                user.email.value];
    console.log(data);
    const insertQuery = sql.format('INSERT INTO Lecturers VALUES ? ; ', data);
    let result = await sql.query(insertQuery);
    console.log(await result);
}
