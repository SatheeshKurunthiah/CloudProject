var express = require('express');
var getTasks = require('../javascripts/getTasks.js');
var updateTasks = require('../javascripts/updateTasks.js');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.status(200).send('Backend Server running normally..!!');
});


/* Returns tasks associated with user and selected project */
router.get('/v1/tasks', getTasks);

/* Updates tasks associated with user and selected project */
router.post('/v1/update/tasks', updateTasks);

module.exports = router;