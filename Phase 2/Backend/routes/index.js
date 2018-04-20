var express = require('express');
var tasks = require('../javascripts/tasks.js');
// var updateTasks = require('../javascripts/updateTasks.js');
// var deleteTasks = require('../javascripts/deleteTasks.js');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.status(200).send('Backend Server running normally..!!');
});


/* Returns tasks associated with user and selected project */
router.get('/v1/get/tasks', tasks.getTasks);

/* Create new tasks associated with user and selected project */
router.post('/v1/create/tasks', tasks.createTask);

/* Updates tasks associated with user and selected project */
router.post('/v1/update/tasks', tasks.updateTasks);

/* Deletes list of tasks in a project */
router.delete('/v1/delete/tasks', tasks.deleteTasks);

module.exports = router;