var path = require('path');
var fs = require('fs');
var csv = require('csv-parser');
var async = require('async');

var firstNames = [];
var lastNames = [];

function loadFromCsv(fileName, rowName, array) {
    return new Promise(function (resolve) {
        if (array.length > 0) {
            resolve();
            return;
        }

        fs.createReadStream(fileName)
            .pipe(csv())
            .on('data', function (data) {
                var value = data[rowName];
                array.push(value);
            })
            .on('end', function () {
                resolve();
            });
    });
}

function randomName(array) {
    var min = 0, max = array.length - 1;
    var index = Math.floor(Math.random() * (max - min) + min);
    return array[index];
}

module.exports = function (options) {
    return new Promise(function(resolve) {
        async.parallel([
            c => loadFromCsv(path.join(__dirname, '../resources/names/first_names.csv'), 'firstname', firstNames).then(c),
            c => loadFromCsv(path.join(__dirname, '../resources/names/last_names.csv'), 'lastname', lastNames).then(c)
        ], function () {
            var result = Array.from({ length: options.count }, () => {
                var firstName = randomName(firstNames);
                var lastName = randomName(lastNames);

                return firstName + ' ' + lastName;
            });

            resolve(result);
        });
    });
}