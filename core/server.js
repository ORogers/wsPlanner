'use strict';
const express = require('express');
const config = require('./config');
const util = require('../utility');
const db = require('./dataModule')
const GoogleAuth = require('simple-google-openid');
const bodyParser = require('body-parser');

const app = express();

//miliseconds in one day, used for caching
const oneDay = 86400000;

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
app.use("/",express.static(util.public, { maxAge: oneDay }));

// static views
app.use("/",express.static(util.views, { maxAge: oneDay }));

// server api

// GET    /api/login            -adds the user to the lecturers database if the
//                               the user is not already in the database

// GET    /api/units            -if the request is sent without a query perameter
//                               a list containg objects representing the units
//                               returned

//        ?uID=                 -if request is made with a query perameter of uID (Unit ID)
//                               a JSON objec containg the units topics and the unit itself
//                               is returned in the format {topics: [...], unit: {...}}

// POST   /api/unit             -this api call adds a unit to thhe database. it takes
//                               the following values in the body: title(string),
//                               sTitle(String), desc(String), weeks(int)

// PUT    /api/unit?uID         -this api call will update the unit with a matching
//                               id to the query perameter provied with the required
//                               values in the body. it takes the following Values
//                               in the body: title(string), sTitle(String),
//                               desc(String), weeks(int)

// DELETE /api/unit?uID         -this api call will delete the unit and all related
//                               topics associated with the unit specified by the
//                               query perameter

// GET    /api/topics?uID       -returns all topics for the unit specified in the
//                               query perameter

// PUT    /api/topics           -this route requires two fields in the body, uID (unit ID)
//                               topics (list of topics). it will add any new topics
//                               to the database and update any existing topics

// DELETE /api/topic            -this route is used to delete topics from the database,
//                               it requiers two fields in the body, uID (unit ID)
//                               and tID (topic ID);


app.get('/api/login', onLogin);

//unit routes
app.get('/api/unit',getUnits)

app.post('/api/unit',addUnit);

app.put('/api/unit',updateUnit);

app.delete('/api/unit',deleteUnit);

//topic routes
app.get('/api/topics',sendTopics);

app.put('/api/topics',updateOrAddTopics);

app.delete('/api/topic',deleteTopic);

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
                "data":"<h2><u>Create new unit</u></h2><p>To create a new topic navigate to the my units list and select 'add new unit'. From there you will be prompted to fill in the details of the unit. Then click add unit and the unit will be save</p><p><br></p><h2><u>Add new topic</u></h2><p>To add a new topic, navigate to the unit you wish to at a topic to using the 'My Units' list. Then click the plus button at the bottom of the topics list. A new topic will appear in the top of the in the info bar. fill in the information and press save.</p><p><br></p><h2><u>Add new note</u></h2><p>to add a new note click the add note button in the topics bar</p><p><br></p><h2><br></h2>"
            },
            note2:{
                "title":"How To",
                "data":"<h2><u>Re-order topics</u></h2><p>to re order topics, click and drag the topic in the topics menu to the position you want it to be in.</p><p><br></p><h2><u>Change or delete unit detail</u></h2><p>To change a units details, click the information icon next to the units long name</p><p><br></p><h2><u>delete a topic</u></h2><p>to delete a topic press the delete button in the info bar.</p><p><br></p>"
            }
        }

    notes = JSON.stringify(notes);
    let tutorial ={
        tName: "Tutorial",
        tNotes: notes,
        tOrder: 0,
        tWeeks: 1,
        uID: uID,
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
