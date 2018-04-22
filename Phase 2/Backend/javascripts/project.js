const db = require('../services/db.js');
const table = 'Project';

exports.getProjects = function(req, res){
    var projects = [
        'Project 1',
        'Project 2'
    ];

    res.status(200).send(projects);
};