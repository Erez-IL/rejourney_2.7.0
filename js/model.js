var db = null;
//*********************************************************************************************************************************************************************

var readyCB = function(){  //Anon function for onDeviceReady.
    if(navigator.network.connection.type == Connection.NONE){
        $("#home_network_button").text('No Internet Access')
                                 .attr("data-icon", "delete")
                                 .button('refresh');
    }
    // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readJourneys, fail); //Check if the user will allow you to access filesystem
    createDB();
    getSQLResults();
};

document.addEventListener("deviceready", readyCB);

function createDB(){
    if(!db){
        console.log("DB Doesn't exist");
        db = window.openDatabase("ReJourneyDB2", "1.0", "ReJourneyDB", 200000); //This method will create a new SQL Lite Database and return a Database object.
        console.log("DB Created");
        console.log(db);
    }
    db.transaction(populateDB, errorCB, successCB); //Run transaction to create initial tables
}

function errorCB(err) {
    alert("errorCB: Error processing SQL: "+ err.message);
}

function successCB() {
    // alert("db success!");
}

//Populate database functions.
function populateDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS Journeys (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, start INTEGER, end INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, journey_id INTEGER, timestamp INTEGER, lat REAL, lon REAL, FOREIGN KEY(journey_id) REFERENCES Journeys(id))');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Photos (id INTEGER PRIMARY KEY AUTOINCREMENT, journey_id INTEGER, lat REAL, lon REAL, timestamp INTEGER, uri TEXT, FOREIGN KEY(journey_id) REFERENCES Journeys(id))');
    // tx.executeSql('INSERT INTO Journeys(name) values(?)', journeyName); //Write journey name to db when start journey button is clicked.
    // tx.executeSql('INSERT INTO Tracks(journey_id, latitude, longitude) values(?,?,?)', [journey_id, startLat, startLong]);
}

function queryDB(tx){
    tx.executeSql(
        'SELECT * FROM Journeys', [], querySuccess, errorCB);
}

function querySuccess(tx, results){
    console.log('results.rows.length' + results.rows.length);
}

function getSQLResults(){
    if(!db){
        ("rejourneyDatabase", "1.0", "ReJourneyDB", 200000);
    }
        db.transaction(queryDB,errorCB);
    }
//*********************************************DATABASE MANIPULATION VIA HTML PAGE BUTTONS********************************************************************
function addJourneyToDB(journeyName, startTime) {
    console.log('Inside addJourneyToDB');

    function successful_insert(tx, results) {
        console.log("Successsful insert" + results);
        console.log(results.insertId);
        console.log(results.rowsAffected);
        // console.log(results.rows.item(0));
        journey_id = results.insertId;
        console.log("Started journey " + results.insertId);
    }

    function journey_insert(tx) {
        // console.log('Inside; db.transaction(function(transaction). transaction = ' + transaction);
        var SQL = 'INSERT INTO Journeys (name, start) VALUES (?, ?)';
        console.log( 'SQL: ' + SQL);
        tx.executeSql(SQL, [journeyName, startTime], successful_insert);
    };

    db.transaction(journey_insert, errorCB, function() {
        console.log("Successful transaction");
    });
}

function endJourneyInDB(journey_id) {
    db.transaction(function(transaction){ //The SQL var is the sql string statement, in place of populateDB.
        endtime = Date.now();
        SQL = "UPDATE Journeys SET end=? WHERE id=?";
        // SQL = 'INSERT INTO Journeys (end) WHERE name = ' + journeyName;
        // SQL += "VALUES (" + endTime + ")";
        transaction.executeSql(SQL, [endtime, journey_id], function(tx, results) { console.log("JOURNEY ENDED YEAAAAHHHH")} );
    }, errorCB, successCB);
}

function addTrackPointToDB(journey_id, position) {
    db.transaction(function(transaction){ //The SQL var is the sql string statement, in place of populateDB.
        SQL = 'INSERT INTO Tracks (journey_id, lat, lon, timestamp) VALUES (?, ?, ?, ?)'
        // SQL += "VALUES (" + journey_id + "," + position.latitude + "," + position.longitude + "," + position.timestamp + ")";
        transaction.executeSql(SQL, [journey_id, position.coords.latitude, position.coords.longitude, position.timestamp]);
        console.log("Adding track point " + position.coords.latitude + ", " + position.coords.longitude);
    }, errorCB, successCB);
}

function addPhotoToDB(journey_id, position, photo_uri) {
    db.transaction(function(transaction){ //The SQL var is the sql string statement, in place of populateDB.
        SQL = 'INSERT INTO Photos (journey_id, latitude, longitude, timestamp, uri) WHERE journey_id = ' + journey_id;
        SQL += "VALUES (" + journey_id + "," + position.latitude + "," + position.longitude + "," + position.timestamp + uri + ")";
        transaction.executeSql(SQL);
    }, errorCB, successCB);
}
    // //Write data to db
    // db.transaction(function(tx) {
    //     tx.executeSql('INSERT INTO Journey (name, start) VALUES ("' + journeyName + '", ' + Date.now() + ')'); //Insert Journet name and current time.
    //     tx.executeSql('INSERT INTO Tracks (latitude, longitude, timestamp) VALUES ("' + journeyName + '", ' + Date.now() + ')'); //Insert Journet name and current time.
    // }, errorCB, successCB);
