module.exports = function (req, res) {
    var tasks = req.body.tasks;
    if (!tasks) {
        return res.status(500).json({
            message: 'Please send tasks to update..!!'
        });
    }

    //Update the data in DB..
    console.log(JSON.stringify(tasks));

    res.status(200).json({
        message: 'Tasks Updated..!!'
    });
};