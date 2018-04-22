const db = require('../services/db.js');
const table = 'User';

exports.getUser = function (req, res) {
    var users = [
        'User 1',
        'User 2'
    ];

    res.status(200).send(users);
}