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
    console.log(new Date(), req.method, req.url);
    next();
});


// static files
app.use("/",express.static(util.public));

// static views
app.use("/",express.static(util.views));


//routes
app.get('/api/login', onLogin);

app.get('/api/unit',getUnits)

app.post('/api/unit',addUnit);

app.put('/api/unit',updateUnit);

app.delete('/api/unit',deleteUnit);

app.post('/api/topic',addTopic);

app.delete('/api/topic',deleteTopic);

app.get('/api/topics',sendTopics);

app.put('/api/topics',updateOrAddTopics);

app.get('*', (req, res) => res.sendStatus(404));


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

    //adds welcome topic to new units added
    let uID =  result[0].insertId;
    let notes = {
            note0:{
                "title":"Welcome note",
                "data":"<h1><strong><u>Welcome</u></strong></h1><p>You can fill notes with anything you want, like Lecture or practical plans, links to lecture slides or online resources, anything that will help you to plan your unit.</p>"
            },
            note1:{
                "title":"How To",
                "data":"<h2><u>Create new unit</u></h2><p>To create a new topic navigate to the my units list and select 'add new unit'. From there you will be prompted to fill in the details of the unit. Then click add unit and the unit will be save</p><p><br></p><h2><u>Add new topic</u></h2><p>To add a new topic, navigate to the unit you wish to at a topic to using the 'My Units' list. Then click the plus button at the bottom of the topics list.</p><p><br></p><p><br></p>"
            }
        }

    notes = JSON.stringify(notes);
    let tutorial ={
        tName: "Tutorial",
        tNotes: notes,
        tOrder: 0,
        tWeeks: 1,
        uID: uID,
        tLeader: user.lID
    }
    db.addTopic(tutorial);
    res.send(result);

}

async function updateUnit(req,res){
    let user = await db.findUser(req.user);
    if(await db.isCoor(user.lID,req.query.uID)){
        let unit = {
            uID: req.query.uID,
            title: req.body.title,
            sTitle:req.body.sTitle,
            desc: req.body.desc,
            weeks: req.body.weeks
        }
        let result = await db.updateUnit(unit);
        res.sendStatus(200);
    }else{
        res.sendStatus(401);
    }
}

async function deleteUnit(req,res){
    if(req.query.uID == undefined || req.query.uID <= 0){
        res.sendStatus(400);
    }
    try{
        let user = await db.findUser(req.user);
        if(await db.isCoor(user.lID,req.query.uID)){
            db.deleteTopicsByUnit(req.query.uID);
            db.deleteUnit(req.query.uID);
            res.sendStatus(200);
        }else{
            res.sendStatus(401);
        }
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

async function addTopic(req,res){
    let result = await db.addTopic(req.body);
    res.send(result);
}

async function deleteTopic(req,res){
    let user = await db.findUser(req.user);
    try{
        if(await db.isCoor(user.lID,req.body.uID)){
            let result = await db.deleteTopic(req.body.tID);
            res.sendStatus(200);
        }else{
            res.sendStatus(401);
        }
    }catch(err){
        res.sendStatus(500);
    }

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

async function updateOrAddTopics(req,res){
    let topics = req.body.topics;
    let existingTopics = [];
    try{
        for (let topic of topics){
            if(topic.tID != undefined){
                existingTopics.push(topic);
            }else{
                db.addTopic(topic);
            }
        }
        if (existingTopics.length > 0) await db.updateTopics(existingTopics);
        res.sendStatus(200);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}
