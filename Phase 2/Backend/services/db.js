const Datastore = require('@google-cloud/datastore');
const projectId = 'bugtracker-201402';
const datastore = new Datastore({
    projectId: projectId,
});

const categories = [
    'backlog',
    'todo',
    'progress',
    'resolved'
];

var getKey = function (table, key) {
    if (key == undefined)
        return null;
    return datastore.key([table, key]);
};

exports.storeData = function (table, key, data) {
    const task = {
        key: getKey(table, key),
        data: data,
    };
    return datastore.save(task);
};

exports.updateData = function (table, key, data) {
    const entity = {
        key: getKey(table, key),
        data: data,
    };

    return datastore.update(entity);
};

exports.getDataByValue = function (table, pair) {
    const query = datastore.createQuery(table);
    for (var key in pair) {
        query.filter(key, '=', pair[key]);
    }
    return datastore.runQuery(query);
};

exports.getDataByKey = function (table, key) {
    var taskKey = getKey(table, key);

    return datastore.get(taskKey);
};

exports.getAllData = function (table) {
    const query = datastore
        .createQuery(table);

    return datastore.runQuery(query)
};

exports.getDataByProjectAndCategories = function (table, user, project) {
    var categoriesList = []
    categories.forEach(category => {
        categoriesList.push(new Promise(function (resolve, reject) {
            const query = datastore
                .createQuery(table)
                .filter('category', '=', category)
                // .filter('assignee', '=', user)
                // .filter('assignee', '=', 'Not Assigned')
                // .filter('createdBy', '=', user)
                .filter('project', '=', project);
            datastore.runQuery(query).then(results => {
                resolve(results[0]);
            })
        }));
    });

    return Promise.all(categoriesList);
};

exports.deleteData = function (table, keys) {
    var entities = [];
    keys.forEach(function (key) {
        entities.push(getKey(table, key))
    }, this);
    return datastore.delete(entities);
};