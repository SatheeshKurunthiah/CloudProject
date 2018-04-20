var shortid = require('shortid');

function getTasks(req, res, user){
    var result = [{
        name: 'backlog',
        displayName: 'Backlog',
        items: [{
            taskId: shortid.generate(),
            title: 'Facebook',
            description: 'https://www.facebook.com'
        }, {
            taskId: shortid.generate(),
            title: 'Youtube',
            description: 'https://www.youtube.com'
        }]
    }, {
        name: 'todo',
        displayName: 'To Do',
        items: [{
            taskId: shortid.generate(),
            title: 'Google',
            description: 'https://www.google.com'
        }, {
            taskId: shortid.generate(),
            title: 'Whatsapp',
            description: 'https://www.web.whatsapp.com'
        }]
    }, {
        name: 'progress',
        displayName: 'In Progress',
        items: [{
            taskId: shortid.generate(),
            title: 'Amazon',
            description: 'https://www.amazon.com'
        }, {
            taskId: shortid.generate(),
            title: 'Instagram',
            description: 'https://www.instagram.com'
        }]
    }, {
        name: 'resolved',
        displayName: 'Resolved',
        items: [{
            taskId: shortid.generate(),
            title: 'Yahoo',
            description: 'https://www.yahoo.com'
        }, {
            taskId: shortid.generate(),
            title: 'GMail',
            description: 'https://www.gmail.com'
        }]
    }];

    res.status(200).send(JSON.stringify(result));
};

exports.getTasks = function (req, res) {
    var user = req.query.user || true;
    
    console.log(user);
    if (!user) {
        return res.status(400).json({ message: 'User not found..!!' });
    }

    getTasks(req, res, user);
};

exports.createTask = function(req, res){
    var task = req.body.task;
    if (!task) {
        return res.status(400).json({
            message: 'Please send details to create new task..!!'
        });
    }

    //Update the data in DB..
    console.log(JSON.stringify(task));

    res.status(200).json({
        message: 'Tasks Created..!!'
    });
};

exports.updateTasks = function (req, res) {
    var tasks = req.body.tasks;
    if (!tasks) {
        return res.status(400).json({
            message: 'Please send tasks to update..!!'
        });
    }

    //Update the data in DB..
    console.log(JSON.stringify(tasks));

    res.status(200).json({
        message: 'Tasks Updated..!!'
    });
};

exports.deleteTasks = function(req, res){
    var tasks = req.query.tasks;
    if (!tasks) {
        return res.status(500).json({
            message: 'No task id provided..'
        });
    }

    //Delete the data in DB..
    console.log(JSON.stringify(tasks));

    res.status(200).json({
        message: 'Tasks deleted..!!'
    });
}