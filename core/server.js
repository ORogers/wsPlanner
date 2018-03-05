'use strict';
const express = require('express');
const config = require('./config');
const util = require('../utility');
const db = require('./dataModule')
const GoogleAuth = require('simple-google-openid');

const app = express();

app.use(GoogleAuth(config.gAuth.clientID));
app.use('/api', GoogleAuth.guardMiddleware({
    realm: 'jwt'
}));


// static files
app.use('/', express.static(util.public));

app.get('/api', (req,res) =>{
    res.send(req.user.displayName + ' is logged in');
} );

app.get('/api/login', onLogin);

// Starts server
app.listen(8080, (error) => {
    if (error) console.error('ERROR: Server could not start', error);
    else console.log('Server started. Listening on port 8080')
});

//Server functions

function onLogin(req, res){
    db.findOrAdd(req.user);
    res.sendFile(util.views + '/dashboard.html');
}
