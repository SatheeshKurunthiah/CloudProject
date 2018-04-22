const shortid = require('shortid');
const db = require('../services/db.js');
const table = 'Tasks';

const categories = [
    'backlog',
    'todo',
    'progress',
    'resolved'
];
const dCategories = [
    'Backlog',
    'To do',
    'In Progress',
    'Resolved'
];

var generateKey = function (task) {
    return task.name.split(' ').join('_') + '_' + task.project.split(' ').join('_');
}

exports.getTasks = function (req, res) {
    var user = req.query.user || true;

    if (!user) {
        return res.status(400).json({
            message: 'User not found..!!'
        });
    }

    // Get data from db
    var result = [];
    Promise.all([db.getAllData(table)]).then(function (tasks) {
        var index = 0;
        categories.forEach(function (category) {
            result.push({
                name: category,
                displayName: dCategories[index],
                items: tasks[0][index]
            })
            index += 1;
        }, this);

        res.status(200).send(JSON.stringify(result));
    });
};

exports.createTask = function (req, res) {
    var task = req.body.task;
    if (!task) {
        return res.status(400).json({
            message: 'Please send details to create new task..!!'
        });
    }

    //Create data in DB..
    task.created = Date.now();
    task.category = 'backlog';
    task.categoryDisplayName = 'Backlog';
    var key = generateKey(task);
    Promise.all([db.storeData(table, key, task)]).then(function () {
        res.status(200).json({
            message: 'Tasks Created..!!'
        });
    });
};

exports.updateTasks = function (req, res) {
    var toBeUpdatedTask = req.body.tasks;
    if (!toBeUpdatedTask) {
        return res.status(400).json({
            message: 'Please send tasks to update..!!'
        });
    }

    //Update the data in DB..
    var key = generateKey({
        name: toBeUpdatedTask.taskName,
        project: toBeUpdatedTask.project
    });
    var getData = db.getDataByKey(table, key);
    var updateData = getData.then(function (task) {
        task.category = toBeUpdatedTask.to;
        task.categoryDisplayName = dCategories[categories.indexOf(toBeUpdatedTask.to)];
        return task;
    });
    var saveData = updateData.then(function (task) {
        return db.updateData(table, key, task);
    })

    Promise.all([getData, updateData, saveData]).then(function (result) {
        res.status(200).json({
            message: 'Tasks updated..!!'
        });
    });
};

exports.deleteTasks = function (req, res) {
    var tasks = req.query.tasks;
    if (!tasks) {
        return res.status(500).json({
            message: 'No task id provided..'
        });
    }

    //Delete the data in DB..
    var keys = []
    if (Array.isArray(tasks)) {
        tasks.forEach(function (item) {
            keys.push(generateKey(JSON.parse(item)));
        }, this);
    } else {
        keys.push(generateKey(JSON.parse(tasks)));
    }

    Promise.all([db.deleteData(table, keys)]).then(function () {
        res.status(200).json({
            message: 'Tasks deleted..!!'
        });
    });
}