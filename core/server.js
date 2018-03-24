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



// static files
app.use("/",express.static(util.public));

// static views
app.use("/",express.static(util.views));

// app.get('/', (req,res) => {
//     res.sendFile('/index.html');
// });
//
// app.get('/dashboard', (req,res) => {
//     res.sendFile('/dashboard.html')
// })

app.get('/api', (req,res) =>{
    res.send(req.user.displayName + ' is logged in');
});

app.get('/api/login', onLogin);

app.post('/api/unit',addUnit);
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

async function addUnit(req,res){

    let userResult = await db.findUserID(req.user);
    let user = userResult[0][0];
    let unit = {
        title: req.body.title,
        sTitle:req.body.sTitle,
        desc: req.body.desc,
        coor: user.lID,
        weeks: req.body.weeks
    }
    let result = db.addUnit(unit);
    res.send(result);

}
