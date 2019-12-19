/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

const express = require('express');
const router = express.Router();

const secure = require('express-force-https');
router.use(secure);

//view routes
router.get('/', function(req, res){
	res.render('pages/index');
});

router.get('/auth', function(req, res){
	res.render('pages/auth');
});


module.exports = router;