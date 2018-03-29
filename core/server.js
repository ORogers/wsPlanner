'use strict';
const express = require('express');
const config = require('./config');
const util = require('../utility');
const db = require('./dataModule')
const GoogleAuth = require('simple-google-openid');
const bodyParser = require('body-parser');

const app = express();


app.use(GoogleAuth(config.gAuth.clientID));
app.use('/api', GoogleAuth.guardMiddleware({
    realm: 'jwt'
}));
app.use(bodyParser.json());

// log all requests to console
app.use('/', (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    console.log(new Date(), ip, req.method, req.url);
    next();
});


// static files
app.use("/",express.static(util.public));

// static views
app.use("/",express.static(util.views));


app.get('/api', (req,res) =>{
    res.send(req.user.displayName + ' is logged in');
});

app.get('/api/login', onLogin);

app.get('/api/unit',getUnits)

app.post('/api/unit',addUnit);

app.post('/api/topic',addTopic);

app.get('/api/topics',sendTopics);



// Starts server
app.listen(8080, (error) => {
    if (error) console.error('ERROR: Server could not start', error);
    else console.log('Server started. Listening on port 8080')
});

//Server functions

function onLogin(req, res){
    db.findOrAdd(req.user);
    res.redirect("/dashboard");
}


async function getUnits(req,res){
    try{
        if(req.query.uID == undefined || req.query.uID <= 0){
            let results = await db.getUnits(req);
            res.status(200).json(results);
        }else{
            let response = {};
            response.topics = await db.topicsByUnit(req.query.uID);
            response.unit = await db.getUnit(req.query.uID);
            res.status(200).json(response);
        }

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }


}
async function addUnit(req,res){
    let user = await db.findUser(req.user);
    let unit = {
        title: req.body.title,
        sTitle:req.body.sTitle,
        desc: req.body.desc,
        coor: user.lID,
        weeks: req.body.weeks
    }
    let result = await db.addUnit(unit);
    res.send(result);

}

async function addTopic(req,res){
    let topic = {
        name: req.body.name,
        order: req.body.tOrder,
        uID: req.body.uID,
        leader: req.body.leader,
        weeks: req.body.weeks,
        notes: req.body.notes
    }
    let result = await db.addTopic(topic);
    res.send(result);
}

async function sendTopics(req,res){
    if(req.query.uID == undefined || req.query.uID <= 0){
        res.sendStatus(400);
    }

    try{
        let results = await db.topicsByUnit(req.query.uID);
        res.status(200).json(results);
    }catch(err){
        res.sendStatus(500);
    }
}
