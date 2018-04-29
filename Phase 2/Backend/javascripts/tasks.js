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

exports.getTasks = function (req, res) {
    var user = req.query.user,
        project = req.query.project;

    if (!project || !user) {
        return res.status(400).json({
            message: 'Please send project name and user name..!!'
        });
    }

    // Get data from db
    var result = [];
    Promise.all([db.getDataByProjectAndCategories(table, user, project)]).then(function (tasks) {
        var index = 0;
        categories.forEach(function (category) {
            var items = tasks[0][index].map(x => {
                if (x.createdBy == user || x.assignee == user)
                    return x;
            });
            if (items.length > 0) {
                var i = 0;
                items.forEach(function (item, index, object) {
                    if (item === undefined) {
                        object.splice(i, 1);
                    }
                    i += 1;
                });
            }
            result.push({
                name: category,
                displayName: dCategories[index],
                items: items
            });
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
    task.taskId = shortid.generate();
    task.created = new Date().toDateString();
    task.category = 'backlog';
    task.categoryDisplayName = 'Backlog';
    task.comments = [];
    var key = task.taskId;
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
    var key = toBeUpdatedTask.taskId;
    var getData = db.getDataByKey(table, key);
    var updateData = getData.then(function (task) {
        task = task[0];
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
            keys.push(JSON.parse(item).id);
        }, this);
    } else {
        keys.push(JSON.parse(tasks).id);
    }

    Promise.all([db.deleteData(table, keys)]).then(function () {
        res.status(200).json({
            message: 'Tasks deleted..!!'
        });
    });
};

exports.getComments = function (req, res) {
    var id = req.query.taskId;
    if (!id) {
        return res.status(400).json({
            message: 'Please send task id to retrieve..!!'
        });
    }

    Promise.all([db.getDataByKey(table, id)]).then(function (task) {
        res.status(200).send(JSON.stringify(task[0][0].comments));
    });
};

exports.addComment = function (req, res) {
    var data = req.body.comment;
    if (!data) {
        return res.status(400).json({
            message: 'Please send comment to add..!!'
        });
    }

    // Add comments to DB
    var key = data.id;
    var getData = db.getDataByKey(table, key);
    var updateData = getData.then(function (task) {
        task[0].comments.push({
            user: data.user,
            time: new Date().toDateString(),
            order: Date.now(),
            comment: data.comment
        });
        return task[0];
    });
    var saveData = updateData.then(function (task) {
        return db.updateData(table, key, task);
    })

    Promise.all([getData, updateData, saveData]).then(function (result) {
        res.status(200).json({
            message: 'Comments added..!!'
        });
    });

};