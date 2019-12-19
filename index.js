/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

require('dotenv').config();
require('handlebars');

const express = require('express');
const app = express();

const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const router = require('./routes/');
const authRoute = require('./routes/auth');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json({
    extended: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/', { redirect : false }));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/', router);
app.use('/auth', authRoute);


const PORT = process.env.PORT || 3000;

const server = app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE')
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
}).listen(PORT, function(){
	console.log("Started listening on port " + PORT);
});

const io = socketIO(server, {
    serveClient: true,
    path: '/socket.io'
}).listen(server);

module.exports = server;