/**
 * This is the script for loading the top 200K domains into the DB.
 */

var argv = require('minimist')(process.argv.slice(2));
var Promise = require('bluebird');
var csv = Promise.promisifyAll(require('csv'));
var fs = Promise.promisifyAll(require('fs'));
var domainService = require('../services/domainService');

if (!argv.f) console.log('-f flag required');
if (!argv.n) console.log('-n flag required');

fs.readFileAsync(argv.f)
    .then(function (fileData) {
        return csv.parseAsync(fileData)
    }).then(function(domainData) {

        loadCSV(domainData, argv.n, 0);

    });


/**
 * Recursively loads domains into the DB
 *
 * @param csvData
 * @param n Number of rows to load
 * @param i Current Row
 */
function loadCSV (csvData, n, i) {


    if (n < i || csvData.length < i) {
        return;
    }
    // I do this recursively so I can control the execution to run one at a time.
    // This is not "technically" recursion because of the way JS handles callbacks, so it wont hit a max recursion depth.

    // On 2nd thought Node probably isn't a good choice for loading data like this.
    // Before I did this recursively I was getting this memory leak:
    // http://stackoverflow.com/questions/15581978/nodejs-how-to-debug-eventemitter-memory-leak-detected-11-listeners-added
    // You can see from the top answer it is caused by a bug in Node that was recently introduced.

    domainService
        .createDomain(csvData[i][1])
        .then(function () {
            loadCSV(csvData, n, ++i);
        }).catch(function (error) {
            console.error(error);
            loadCSV(csvData, n, ++i);
        });

}
