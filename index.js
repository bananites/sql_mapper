#!/usr/bin/env node
const NORMAL = 2;
const WITH_FLAG = 3
const args = process.argv.slice(NORMAL);

var fs = require('fs');
var trimResult = false;

if (args.length === 0) {
    console.log("You need to specify a Filename")
    process.exit(1);
}
try {

    if (!checkForFlag()) {
        readFile(args);
        return;
    }


    newArgs = process.argv.slice(WITH_FLAG);

    switch (args[0].replace("-", "")) {
        case "t":
            trimResult = true;
            readFile(newArgs);
            break;

        default:
            break;
    }



} catch (error) {
    console.log(error)

}


function checkForFlag() {

    if (args[0].startsWith("-")) {
        return true;
    }

    return false;

}




function readFile(newArgs) {

    fs.readFile(newArgs[0], 'utf-8', function (err, data) {
        if (err) throw err;
        const sqlObject = parseSQL(data);

        if (newArgs[1]) {
            writeIntoFile(sqlObject, newArgs[1]);
            return
        }

        console.log(sqlObject);
        return



    })
}
function writeIntoFile(sqlObject, filename) {
    fs.writeFile(filename + ".json", JSON.stringify(sqlObject, null, 2), "utf-8", (err) => {
        if (err) {
            console.error("Fehler beim Schreiben der Datei:", err);
        } else {
            console.log("Datei wurde abgelegt");
        }
    })

}

function parseSQL(sql) {
    const fieldValueArray = extractBetweenBrackets(sql)

    const obj = getValuesFromStrings(fieldValueArray);

    return obj;

}

function extractBetweenBrackets(sql) {
    const matches = sql.match(/\(([^)]+)\)/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
}

function getValuesFromStrings(matches) {
    var fields = matches[0].split(",");
    var values = matches[1].split(",");

    var data = {};

    for (var i = 0; i < fields.length; i++) {
        if (trimResult) {
            data[fields[i].trim()] = values[i].trim();
            continue;
        }

        data[fields[i]] = values[i];

    }
    return data
}



