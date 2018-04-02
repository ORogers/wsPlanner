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

module.exports.findUser = async function findUser(user){
    const sql = await init();
    let query = 'SELECT * from Lecturers where email = ?';
    try{
        let result = await sql.query(sql.format(query,user.emails[0].value));

        if(result[0].length == 0){
            return(false);
        }else{
            return(result[0][0])
        }
    }catch(err){
        throw err;
    }
}

module.exports.getUnits= async function(req){
    try{
        const sql = await init();
        let query = `SELECT
        units.uID, units.uTitle, units.uShortTitle, units.uDesc,
        units.uWeeks, lecturers.fName, lecturers.lName
        FROM units
        INNER JOIN lecturers
            ON units.uCoor = lecturers.lID
        WHERE lecturers.email= ?`;

        query = sql.format(query,req.user.emails[0].value);
        let results = await sql.query(query);
        return results[0];
    }catch(err){
        console.log(err);
    }
}

module.exports.getUnit = async function(uID){
    try{
        const sql = await init();
        let query = 'SELECT * FROM units where uID = ?';
        query = sql.format(query,uID);
        let result = await sql.query(query);
        if(result[0].length == 0){
            return(false);
        }else{
            return(result[0])
        }
    }catch(err){
        throw err;
    }

}

module.exports.addUnit = async function(unit){
    const sql = await init();
    let query = 'INSERT into units(??) Values (?)'
    let coulumns = ['uTitle','uShortTitle','uDesc','uCoor','uWeeks']
    let values = [unit.title, unit.sTitle,unit.desc, unit.coor, unit.weeks];
    query =sql.format(query,[coulumns,values])
    try{
        let result = await sql.query(query);
        return result;
    }catch(err){
        throw err;
    }
}

 module.exports.updateUnit = async function(unit){
     const sql = await init();
     let query = 'UPDATE units set uTitle = ?, uShortTitle= ?, uDesc = ?, uWeeks = ? WHERE uID = ?';
     const values = [unit.title, unit.sTitle, unit.desc, unit.weeks, unit.uID];
     query = sql.format(query, values);
     try{
         let result = await sql.query(query);
         return result;
     }catch(err){
         throw err;
     }
 }

 module.exports.isCoor = async function(lID,uID){
    const sql = await init();
    let query = 'SELECT * FROM units WHERE uCoor = ?  AND uID = ?'
    let values = [lID,uID];
    try{
        let result = await sql.query(sql.format(query, values));
        if (result[0].length == 0){
            return false;
        }else{
            return true;
        }
    }catch(err){
        throw err;
    }
}
module.exports.isCoauth = async function(lID,uID){
    const sql = await init();
    let query = 'SELECT * FROM coauthors WHERE lID = ?  AND uID = ?'
    let values = [lID,uID];
    try{
        let result = await sql.query(sql.format(query, values));
        if (result[0].length == 0){
            return false;
        }else{
            return true;
        }
    }catch(err){
        throw err;
    }
}

module.exports.addTopic = async function(topic){
    const sql = await init();
    let query = 'INSERT into topics(??) Values (?)';
    const coulumns = ['tName','uID',"tLeader",'tWeeks','tOrder','tNotes'];
    let values = [topic.tName,topic.uID,topic.tLeader,topic.tWeeks,topic.tOrder,topic.tNotes];
    query = sql.format(query,[coulumns,values]);
    try{
        let result = await sql.query(query);
        return result;
    }catch(err){
        throw err;
    }
}

module.exports.updateTopics = async function(topics){
    const sql = await init();
    let queries = '';
    //const coulumns = ['tName','uID',"tLeader",'tWeeks','tOrder','tNotes'];
    topics.forEach(function(topic){
        let values = [topic.tName,topic.tLeader,topic.tWeeks,topic.tOrder,topic.tNotes,topic.tID];
        queries += sql.format("UPDATE topics SET tName = ?, tLeader = ?, tWeeks = ?, tOrder = ?, tNotes = ? WHERE tID = ?;",values)
    });

    try{
        let result = await sql.query(queries);
        return result;
    }catch(err){
        throw err;
    }
}

module.exports.topicExists = async function(tID){
    const sql = await init();
    let query = 'SELECT * FROM topics WHERE tID = ?'
    query = sql.format(query,tID);
    try{
        let result = await sql.query(query);
        if (result[0].length == 0){
            return false;
        }else{
            return true;
        }
    }catch(err){
        throw err;
    }
}

module.exports.findOrAdd = async function(user){
    const sql = await init();

    let query = 'SELECT * from Lecturers where email = ?';

    try{
        let result = await sql.query(sql.format(query,user.emails[0].value));

        if(result[0].length == 0){
            console.log("Adding user to database")
            return(addUser(user));
        }else{
            console.log("User found")
            return(user)
        }
    }catch(err){
        throw err;
    }
}

module.exports.topicsByUnit = async function(uID){
    const sql = await init();
    let query = `SELECT
        topics.tID, topics.tName, topics.tWeeks,
        topics.tOrder, topics.tNotes,
        topics.tLeader, topics.uID
        FROM topics
        JOIN lecturers ON topics.tLeader = lecturers.lID
        JOIN units ON topics.uID = units.uID
        WHERE topics.uID = ?`;
    query = sql.format(query,uID);
    let results = await sql.query(query);
    for (let topic of results[0]){
        if (topic.tNotes == null) topic.tNotes == {};
    }
    return results[0];
}

async function addUser(user){
    const sql = await init();

    const values = [user.name.givenName, user.name.familyName, user.emails[0].value];
    const columns = ["fName","lName","email"] ;

    let query = 'INSERT into Lecturers(??) values (?)';
    let result = await sql.query(query,[columns,values]);

    return(result);
}
