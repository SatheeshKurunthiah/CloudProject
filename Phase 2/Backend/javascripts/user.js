const shortid = require('shortid');
const db = require('../services/db.js');
const table = 'User';

exports.getUser = function (req, res) {
    var userEmail = req.query.email

    // Get data from db 
    if (userEmail) {
        Promise.all([db.getDataByValue(table, {
            email: userEmail
        })]).then(function (user) {
            var result = user[0][0];
            res.status(200).send(JSON.stringify(result));
        });
    } else {
        Promise.all([db.getAllData(table)]).then(function (users) {
            var result = users[0][0];
            res.status(200).send(JSON.stringify(result));
        });
    }
};

exports.addUser = function (req, res) {
    var user = req.body.user;

    if (!user) {
        return res.status(400).json({
            message: 'Please send details to add user..!!'
        });
    }

    //Create data in DB..
    user.id = shortid.generate();
    user.created = new Date().toDateString();
    var key = user.id;
    Promise.all([db.storeData(table, key, user)]).then(function () {
        res.status(200).json({
            message: 'User added..!!'
        });
    });
};