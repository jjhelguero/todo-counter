var findInFiles = require('find-in-files');
var fs = require('fs');
const readmeFile = 'README.md'
let TODOcounter = 0;

findInFiles
    .find({ term: /\/\/\s?todo/, flags: 'ig' }, 'Test', '.js$')
    .then(function (results) {

        console.log('Searching for TODOs\n')
        for (var result in results) {
            var res = results[result];
            console.log(
                'found "' +
                res.matches[0] +
                '" ' +
                res.count +
                ' times in "' +
                result +
                '"',
            );

            TODOcounter += res.count;
        }
        console.log('\nTotal found Todos: ' + TODOcounter);


        // TODO check TODO counter equals TODOs found, if so update, if not do not update
        fs.readFile(readmeFile, 'utf-8', function (err, data) {
            if (err) throw err;

            // find and replace todo counter in README file
            var newValue = data.replace(/current\stodo\scounter:\s\d/i, `Current TODO counter: ${TODOcounter}`);

            console.log(`\nUpdating ${readmeFile} file with updated todo count of ${TODOcounter}\n`)
            fs.writeFile(readmeFile, newValue, 'utf-8', function (err, data) {
                if (err) throw err;
                console.log('TODO counter updated!');
            })
        })
    });