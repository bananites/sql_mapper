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

    if (trimResult) {
        filename = filename + "_trim";
    }

    fs.writeFile("output/" + filename + ".json", JSON.stringify(sqlObject, null, 2), "utf-8", (err) => {
        if (err) {
            console.error("Fehler beim Schreiben der Datei:", err);
        } else {
            console.log("Datei wurde abgelegt");
        }
    })

}

function parseSQL(sql) {
    const { fields, values } = extractBetweenBrackets(sql)

    const obj = getValuesFromStrings(fields, values);

    return obj;

}

function getPositionOfSign(sql, openBrace = "(", closedBrace = ")") {
    let positionOpen = []
    let positionClosed = []

    let indexOpen = sql.indexOf(openBrace);
    let indexClosed = sql.indexOf(closedBrace);

    while (indexOpen !== -1) {
        positionOpen.push(indexOpen);
        indexOpen = sql.indexOf(openBrace, indexOpen + 1);
    }

    while (indexClosed !== -1) {
        positionClosed.push(indexClosed)
        indexClosed = sql.indexOf(closedBrace, indexClosed + 1);
    }

    return {
        opened: {
            count: positionOpen.length,
            position: positionOpen
        },
        closed: {
            count: positionClosed.length,
            position: positionClosed

        }
    }


}

function extractBetweenBrackets(sql) {
    const positions = getPositionOfSign(sql)
    const numOfOpen = positions.opened.count;
    const numOfClosed = positions.closed.count;
    const positionsOpen = positions.opened.position;
    const positionsClosed = positions.closed.position;



    console.log(numOfClosed)
    console.log(numOfOpen)

    if (numOfClosed == 2 && numOfOpen == 2) {
        console.log("entered")
        const fields = sql.substring(positionsOpen[0] + 1, positionsClosed[0])
        const values = sql.substring(positionsOpen[1] + 1, positionsClosed[1])

        return {
            fields, values
        }
    }


    const pairs = searchForBracesPairs(positionsOpen, positionsClosed);

    fields = pairs.pairFields
    values = pairs.pairValues

    const fieldsVal = sql.substring(fields.posOpendOne +1, fields.posClosedOne);
    const valuesVal = sql.substring(values.posOpendTwo +1, values.posClosedTwo);

    return {
        fields: fieldsVal,
        values: valuesVal

    }


}

function searchForBracesPairs(posOpen, posClosed) {

    var posOpendOne = posOpen[0];
    var posClosedOne = posClosed[0]
    var foundPair = false;
    console.log(posOpen)
    console.log(posClosed)


    var counterPos = 1

    while (!foundPair) {

        // wenn unterschiedliche hol dir die erste offene klammer 
        // schaue dann nach der nächsten geschlossene klammer,
        //  schaue dann ob zwischen der offenen und geschlossenen kammer eine weitere offene ist.
        // wenn ja dann nimm die nächste geschlossen, schaue dann nach ob in zwischen den beiden 
        // wieder eine offene + n pro iteration.
        //  wenn nicht dann nimm den string dazwischen und weise zu

        console.log(posOpen[counterPos])
        console.log(posClosed[counterPos - 1])

        if (posOpen[counterPos] < posClosed[counterPos - 1]) {
            console.log(counterPos)
            console.log(posOpen[counterPos])
            console.log(posClosed[counterPos - 1])

            counterPos++;
            continue;
        }
        posClosedOne = posClosed[counterPos - 1]
        foundPair = true;

    }
    var pairFields = { posOpendOne, posClosedOne }
    console.log(pairFields)
    foundPair = false


    var posOpendTwo = posOpen[counterPos]
    var posClosedTwo
    counterPos++;
    while (!foundPair) {

        // wenn unterschiedliche hol dir die erste offene klammer 
        // schaue dann nach der nächsten geschlossene klammer,
        //  schaue dann ob zwischen der offenen und geschlossenen kammer eine weitere offene ist.
        // wenn ja dann nimm die nächste geschlossen, schaue dann nach ob in zwischen den beiden 
        // wieder eine offene + n pro iteration.
        //  wenn nicht dann nimm den string dazwischen und weise zu

        if (posOpen[counterPos] < posClosed[counterPos - 1]) {
            counterPos++;
            continue;
        }

        posClosedTwo = posClosed[counterPos - 1]
        foundPair = true;
    }

    var pairValues = { posOpendTwo, posClosedTwo }
    console.log(pairValues);
    return { pairFields, pairValues }



}

function getValuesFromStrings(fields, values) {
    var fields = fields.split(",");
    var values = values.split(/, (?=(?:[^']*'[^']*')*[^']*$)/);
    var data = {};

    for (var i = 0; i < fields.length; i++) {
        if (trimResult && values[i]) {
            data[fields[i].trim()] = values[i].trim();
            continue;
        }

        data[fields[i]] = values[i];

    }
    return data
}



