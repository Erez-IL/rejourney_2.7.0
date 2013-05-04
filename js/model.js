var db = null;
var current_journey = null;

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
        db = window.openDatabase("ReJourneyDB3", "1.0", "ReJourneyDB", 200000); //This method will create a new SQL Lite Database and return a Database object.
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS Tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, journey_id INTEGER NOT NULL, timestamp INTEGER, lat REAL, lon REAL, FOREIGN KEY(journey_id) REFERENCES Journeys(id))');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Photos (id INTEGER PRIMARY KEY AUTOINCREMENT, journey_id INTEGER NOT NULL, lat REAL, lon REAL, timestamp INTEGER, uri TEXT, FOREIGN KEY(journey_id) REFERENCES Journeys(id))');
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
        current_journey = results.insertId; //Using global current_journey.
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

// function endJourneyInDB(journey_id) {
function endJourneyInDB() {
     if(!current_journey){ //Force a current journey value, so that null journeys are not stored in db.
        db.transaction(function(transaction){ //The SQL var is the sql string statement, in place of populateDB.
            endtime = Date.now();
            SQL = "UPDATE Journeys SET end=? WHERE id=?";
            // SQL = 'INSERT INTO Journeys (end) WHERE name = ' + journeyName;
            // SQL += "VALUES (" + endTime + ")";
            // transaction.executeSql(SQL, [endtime, journey_id], function(tx, results) { console.log("JOURNEY ENDED YEAAAAHHHH")} );
            transaction.executeSql(SQL, [endtime, current_journey], function(tx, results) { console.log("JOURNEY ENDED YEAAAAHHHH")} );
        }, errorCB, successCB);
    }else{
        alert('Please start a journey before ending a journey. :)');
    }
}

// function addTrackPointToDB(journey_id, position) {
function addTrackPointToDB(position) {
    if(!current_journey){ //Force a current journey value, so that null journeys are not stored in db.
        db.transaction(function(transaction){ //The SQL var is the sql string statement, in place of populateDB.
            SQL = 'INSERT INTO Tracks (journey_id, lat, lon, timestamp) VALUES (?, ?, ?, ?)';
            // SQL += "VALUES (" + journey_id + "," + position.latitude + "," + position.longitude + "," + position.timestamp + ")";
            // transaction.executeSql(SQL, [journey_id, position.coords.latitude, position.coords.longitude, position.timestamp]);
            transaction.executeSql(SQL, [current_journey, position.coords.latitude, position.coords.longitude, position.timestamp]);
            console.log("Adding track point " + position.coords.latitude + ", " + position.coords.longitude);
        }, errorCB, successCB);
    }else{
        alert('Cannot add journey point to database.');
    }
}

// function addPhotoToDB(journey_id, position, photo_uri) {
function addPhotoToDB(position, photo_uri) {
    if(!current_journey){ //Force a current journey value, so that null journeys are not stored in db.
        db.transaction(function(transaction){ //The SQL var is the sql string statement, in place of populateDB.
            SQL = 'INSERT INTO Photos (journey_id, lat, lon, timestamp, uri) VALUES (?, ?, ?, ?, ?)';
            transaction.executeSql(SQL, [current_journey, position.coords.latitude, position.coords.longitude, position.timestamp, photo_uri]);
            console.log("current_journey = " + current_journey + "Adding photo point: " + position.coords.latitude + ", " + position.coords.longitude + "," + photo_uri);
        }, errorCB, successCB);
    }else{
        alert('Cannot add photo to database before starting a journey. Please hit start journey.');
    }
}

    // //Write data to db
    // db.transaction(function(tx) {
    //     tx.executeSql('INSERT INTO Journey (name, start) VALUES ("' + journeyName + '", ' + Date.now() + ')'); //Insert Journet name and current time.
    //     tx.executeSql('INSERT INTO Tracks (latitude, longitude, timestamp) VALUES ("' + journeyName + '", ' + Date.now() + ')'); //Insert Journet name and current time.
    // }, errorCB, successCB);
