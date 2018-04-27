const shortid = require('shortid');
const db = require('../services/db.js');
const table = 'Project';

exports.getProjects = function (req, res) {
    var user = req.query.user || true;

    if (!user) {
        return res.status(400).json({
            message: 'User not found..!!'
        });
    }

    // Get data from db
    
    Promise.all([db.getAllData(table)]).then(function (projects) {
        var result = projects[0][0];

        res.status(200).send(JSON.stringify(result));
    });
};

exports.createProject = function(req, res){
    var project = req.body.project;

    if (!project) {
        return res.status(400).json({
            message: 'Please send details to create new project..!!'
        });
    }

    //Create data in DB..
    project.id = shortid.generate();
    project.created = new Date().toDateString();
    var key = project.id;
    Promise.all([db.storeData(table, key, project)]).then(function () {
        res.status(200).json({
            message: 'Project Created..!!'
        });
    });
};