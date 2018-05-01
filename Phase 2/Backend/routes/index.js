var express = require('express');
var tasks = require('../javascripts/tasks.js');
var project = require('../javascripts/project.js');
var user = require('../javascripts/user.js');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.status(200).send('Backend Server running normally..!!');
});

// --------------TASKS------------------

/* Returns tasks associated with user and selected project */
router.get('/v1/get/tasks', tasks.getTasks);

/* Returns comments associated with task id */
router.get('/v1/get/comments', tasks.getComments);

/* Create new tasks associated with user and selected project */
router.post('/v1/create/tasks', tasks.createTask);

/* Create new comment associated with task id */
router.post('/v1/add/comment', tasks.addComment);

/* Updates tasks associated with user and selected project */
router.put('/v1/update/tasks', tasks.updateTasks);

/* Deletes list of tasks in a project */
router.delete('/v1/delete/tasks', tasks.deleteTasks);

// --------------PROJECT------------------

/* Returns list of projects */
router.get('/v1/get/project', project.getProjects);

/* Create new projects */
router.post('/v1/create/project', project.createProject);

// --------------User------------------

/* Returns list of user */
router.get('/v1/get/user', user.getUser);

/* Add user to DB */
router.post('/v1/add/user', user.addUser);

module.exports = router;