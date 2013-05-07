//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************


var db = null;
var currentJourney = null;
var currentJourneyName = null;
var watch_id = null;
var selectedJourney = null;
var selectedJourneyCoords = [];
var selectedJourneyURIs = [];

//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************

var readyCB = function(){  //Anon function for onDeviceReady.
    if(navigator.network.connection.type == Connection.NONE){
        $("#home_network_button").text('No Internet Access')
                                 .attr("data-icon", "delete")
                                 .button('refresh');
    }
    // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readJourneys, fail); //Check if the user will allow you to access filesystem
    if(!db){
        console.log("DB is not connected");
        db = window.openDatabase("ReJourneyDB", "1.0", "ReJourneyDB", 200000); //This method will create a new SQL Lite Database and return a Database object.
        console.log("DB is now connected");
    }
    // dropTables();
    populateDB();
};

document.addEventListener("deviceready", readyCB);

function errorCB(err) {
    alert("errorCB: Error processing SQL: "+ err.message);
}

function successCB() {
    console.log("DB success!");
}

//Populate database functions.
function populateDB() {
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Journeys (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, start TIMESTAMP, end TIMESTAMP)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS TrackPoints (id INTEGER PRIMARY KEY AUTOINCREMENT, journey_id INTEGER NOT NULL, timestamp TIMESTAMP, lat REAL, lon REAL, FOREIGN KEY(journey_id) REFERENCES Journeys(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS PhotoPoints (id INTEGER PRIMARY KEY AUTOINCREMENT, journey_id INTEGER NOT NULL, lat REAL, lon REAL, timestamp TIMESTAMP, uri TEXT, FOREIGN KEY(journey_id) REFERENCES Journeys(id))');
        // tx.executeSql('INSERT INTO Journeys(name) values(?)', journeyName); //Write journey name to db when start journey button is clicked.
        // tx.executeSql('INSERT INTO Tracks(journey_id, latitude, longitude) values(?,?,?)', [journey_id, startLat, startLong]);
    }, errorCB, successCB);
}

//Populate database functions.
function dropTables() {
    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS Journeys');
        tx.executeSql('DROP TABLE IF EXISTS TrackPoints');
        tx.executeSql('DROP TABLE IF EXISTS PhotoPoints');
    }
    , errorCB, successCB);
    // tx.executeSql('INSERT INTO Journeys(name) values(?)', journeyName); //Write journey name to db when start journey button is clicked.
    // tx.executeSql('INSERT INTO Tracks(journey_id, latitude, longitude) values(?,?,?)', [journey_id, startLat, startLong]);
}
//*********************************************************************************************************************************************************************
function queryJourneysDB(tx){
    tx.executeSql(
        'SELECT * FROM Journeys', [], queryJourneysSuccess, errorCB);
}

function queryJourneysSuccess(tx, results){
    console.log('results.rows.length of DB from queryJourneysSuccess' + results.rows.length);
}

function queryCurrentJourney(tx, journeyName){
    console.log("journeyName from queryCurrentJourney = " + journeyName)
    tx.executeSql(
        'SELECT id FROM Journeys WHERE name = ?', [journeyName], queryCurrentJourneySuccess, errorCB);
}

function queryCurrentJourneySuccess(tx, results){
    var len = results.rows.length;
    console.log("Row of currentJourney is: " + len);
    currentJourney = results.rows.item(0).id; //item(0) because we are selecting the first item return from query.
    console.log("currentJourney=" + currentJourney);
}
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
function countTrackPoints() {
    function queryTrackPointsSuccess(tx, results){
        console.log('Number of track points recorded in this journey: ' + results.rows.length);
    }

    function queryTrackPointsFromAJourney(tx){
        tx.executeSql(
            'SELECT * FROM TrackPoints WHERE journey_id = ?', [currentJourney], queryTrackPointsSuccess, errorCB);
    }

    db.transaction(queryTrackPointsFromAJourney, errorCB, successCB);

}
//*********************************************************************************************************************************************************************
function getTrackPointsForSelectedJourney() {
    function queryTrackPointsForSelectedJourneySuccess(tx, results){
        selectedJourneyCoords = [];

        var len = results.rows.length
        console.log('queryTrackPointsForSelectedJourneySuccess. #points:' + len );
        for(var i=0; i<len; i++){
            var j = results.rows.item(i);
            var point = new google.maps.LatLng(j.lat, j.lon);
            console.log("points lat: "+ j.lat + "lon: " + j.lon)
            selectedJourneyCoords.push(point)
        }

    }


    function queryTrackPointsForSelectedJourneyError(error){
        console.log('Unable to query track point for selected journey: ' + error.message);
    }


    function queryTrackPointsForSelectedJourney(tx){
        tx.executeSql(
            'SELECT * FROM TrackPoints WHERE journey_id = ? ORDER BY timestamp', [selectedJourney], queryTrackPointsForSelectedJourneySuccess, queryTrackPointsForSelectedJourneyError);
    }

    db.transaction(queryTrackPointsForSelectedJourney, errorCB, successCB);

}


// function queryCurrentJourneySuccess(tx, results){
//     var len = results.rows.length;
//     console.log("Row of currentJourney is: " + len);
//     currentJourney = results.rows.item(0).id; //item(0) because we are selecting the first item return from query.
//     console.log("currentJourney=" + currentJourney);
// }
//*********************************************************************************************************************************************************************

function addJourneyToDB(journeyName, startTime) {
    console.log('Inside addJourneyToDB');

    // function successful_insert(tx, results) {
    //     alert('Returned ID: ' + results.insertId);
    //     console.log("Successsful insert" + results);
    //     console.log(results.insertId);
    //     console.log(results.rowsAffected);
    //     // console.log(results.rows.item(0));
    //     currentJourney = results.insertId; //Using global currentJourney.
    //     console.log('successful_insert: currentJourney = ' + currentJourney);
    //     console.log("Started journey " + results.insertId);
    // }

    function insertErrorCB(err) {
        console.log("Error processing SQL addJourneyToDB: "+err.code);
    }

    function journey_insert(tx) {
        // console.log('Inside; db.transaction(function(transaction). transaction = ' + transaction);
        var SQL = 'INSERT INTO Journeys (name, start) VALUES (?, ?)';
        console.log( 'SQL: ' + SQL);
        tx.executeSql(SQL, [journeyName, startTime]);
    };

    db.transaction(journey_insert, insertErrorCB, successCB);
    db.transaction(function(tx){queryCurrentJourney(tx, journeyName)}, insertErrorCB, successCB); //The anaonymous function is passing in journeyName to the query.
}

function endJourneyInDB() {
    function updateEndJourney(tx) {
        var SQL = "UPDATE Journeys SET end=? WHERE id=?";
        console.log( 'endJourneyInDB: SQL: ' + SQL);
        tx.executeSql(SQL, [Date.now(), currentJourney]);
    }

    function successUpdateEndJourney(tx) {
        console.log("Journey End!!");
    }

    if(currentJourney){
        db.transaction(updateEndJourney, errorCB, successUpdateEndJourney);
        //Reset Global variables
        currentJourney = null;
        currentJourneyName = null;
        watch_id = null;
        $('#journeyName').val(""); //Clear the journet name input field on the home screen.
    }else{
        alert('Please start a journey before ending a journey. :)');
    }
}
//*********************************************************************************************************************************************************************
function addTrackPointToDB(position) {
    function insertTrackPoint(tx) {
        var SQL = 'INSERT INTO TrackPoints (journey_id, lat, lon, timestamp) VALUES (?, ?, ?, ?)';
        console.log( 'insertTrackPoint: SQL: ' + SQL);
        // alert("Insert trackPoint in db: lat = " + position.coords.latitude + "long = " + position.coords.longitude + "timestamp = " + position.timestamp)
        tx.executeSql(SQL, [currentJourney, position.coords.latitude, position.coords.longitude, position.timestamp]);
    }
    if(currentJourney){ //Force a current journey value, so that null journeys are not stored in db.

        db.transaction(insertTrackPoint, errorCB, successCB);
    }else{
        alert('Cannot add journey point to database. Please start a journey.');
    }
}

function addPhotoToDB(journey_id, position, photo_uri) {
// function addPhotoToDB(position, photo_uri) {
    if(currentJourney){ //Force a current journey value, so that null journeys are not stored in db.
        db.transaction(function(tx){ //The SQL var is the sql string statement, in place of populateDB.
            SQL = 'INSERT INTO PhotoPoints (journey_id, lat, lon, timestamp, uri) VALUES (?, ?, ?, ?, ?)';
            tx.executeSql(SQL, [currentJourney, position.coords.latitude, position.coords.longitude, position.timestamp, photo_uri]);
            console.log("currentJourney:" + currentJourney + " Adding photo point: " + position.coords.latitude + ", " + position.coords.longitude + "," + photo_uri);
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


function getAllPhotos() {
    function log_results(tx,results) {
        console.log("Photos in db (" + results.rows.length + ")");
        for (var i = 0; i < results.rows.length; i++) {
            var item = results.rows.item(i);
            console.log("Photo info");
            console.log(item.id + ", " + item.journey_id + ", " + item.uri);
        }

    }

    function get_photo_query(transaction) {
        SQL = "SELECT * FROM PhotoPoints;";
        transaction.executeSql(SQL, [], log_results);
    }

    db.transaction(get_photo_query, function(err) {console.log(err.message);},
        function() {console.log("Get photo query transaction success")});
}

