


//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************

function onWatchSuccess(position) { //Position object created by the geolocation API: coords + timestamp
    // alert("onStartJourneySuccess");
    // var myLat = position.coords.latitude;
    // var myLong = position.coords.longitude;
    // var startTime = position.timestamp;
    // var myLatLng = new google.maps.LatLng(myLat, myLong);
    // map.setCenter(myLatLng);
    // journeyTracking_data.push(myLatLng);
    // journeyTime_val.push(startTime);
    // last_values = [myLat, myLong];
    // myCoords.push(last_values);

    // var trackPath = new google.maps.Polyline({
    //     path: tracking_data,
    //     strokeColor: "#FF0000",
    //     strokeOpacity: 1.0,
    //     strokeWeight: 2

    // });
    // trackPath.setMap(map);
    //Write to db using model.js functions.
    console.log('onWatchSuccess. Position obj:' + position);
    addTrackPointToDB(position) //Write geolocation to db. See model.js
}

function onStartError(error) {
    alert("onStartError: " + "error.message: " + error.message);
}

$("#startJourney").on('click', function(){
    // alert('startJourney clicked');
    currentJourneyName = $('#journeyName').val(); //from #journeyName_field" of home page
    addJourneyToDB(currentJourneyName, Date.now()); //Write journey name to db when start journey button is clicked. See model.js
    // alert('Map object:' + map);
    console.log('Journey: "' + currentJourneyName + '" started!');

    console.log("Invoking geolocation watch");
    watch_id = navigator.geolocation.watchPosition(onWatchSuccess, onStartError, { // Start tracking
        maximumAge: 1000, //Accept a cached position whose age is no greater than the specified time in milliseconds. (Number)
        // timeout: 5000,
        enableHighAccuracy: false
    });

})
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
function endJourney() { //Position object created by the geolocation API: coords + timestamp
    console.log('Inside endJourney: ');
    countTrackPoints();
    endJourneyInDB(); //Write end time to db when stop journey button is clicked.
    // addTrackPointToDB(position); //Write geolocation to db.

}

function onEndError(error) {
    alert('End Journey Error');
}
$("#stopJourney").on('click', function(){

    navigator.geolocation.clearWatch(watch_id); // Stop tracking.
    alert('Journey: "' + currentJourneyName + '" ended.');
    endJourney();
});

//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************

function onCameraSuccess(imageURI) {
    // var myLat = position.coords.latitude;
    // var myLong = position.coords.longitude;
    // var time = position.timestamp;
    // var myLatLng = new google.maps.LatLng(myLat, myLong);
    // map.setCenter(myLatLng);
    // photoTracking_data.push(myLatLng);
    // photoTime_val.push(time);
    // last_values = [myLat, myLong];
    // myCoords.push(last_values);

    // var photoMarkers = new google.maps.Marker({
    //     path: tracking_data,
    //     strokeColor: "#FF0000",
    //     strokeOpacity: 1.0,
    //     strokeWeight: 2
    // });
    // photoMarkers.setMap(map);

    // alert("onCameraSuccess:" + imageURI);
    // addTrackPointToDB(journey_id, position);
    // addPhotoToDB(journey_id, position, photo_uri);
    // google.maps.event.addDomListener(window, 'load', onCameraSuccess); //https://developers.google.com/maps/documentation/javascript/examples/marker-simple
    // var pos = null;
    alert('inside onCameraSuccess');
    var onPositionSuccess = function(position){
        console.log("position: " + position + "ImageURI: " + imageURI);
        addPhotoToDB(journey_id, position, imageURI);
    }
    var onPositionError = function(error){
        alert("onPositionError: " + error.message);
    }
    console.log('Going to call getCurrentPosition');
    //Get position when user takes a photo.
    navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError);
};


function onCameraError(error) {
    alert('Camera error: ' + error.message);
}

// console.log($("#takePhoto")); //evaluates to the object itself
$("#takePhoto").on('click', function() {
    navigator.camera.getPicture(onCameraSuccess, onCameraError, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true
    });
});



//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************
//*********************************************************************************************************************************************************************

// function onGetCurrentPositionSuccess(position) {
//     var element = document.getElementById('geolocation');
//     element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
//                         'Longitude: '          + position.coords.longitude             + '<br />' +
//                         'Altitude: '           + position.coords.altitude              + '<br />' +
//                         'Accuracy: '           + position.coords.accuracy              + '<br />' +
//                         'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
//                         'Heading: '            + position.coords.heading               + '<br />' +
//                         'Speed: '              + position.coords.speed                 + '<br />' +
//                         'Timestamp: '          +                                   position.timestamp          + '<br />';
// };

// $("#photoPrompt").on('click', function(){ //THIS IS MAJOR PSEUDOCODE
//     navigator.notification.alert(
//     'Take a photo for your journey.', // message
//     okay,                           // callback
//     'ReJourney Photo Prompt',       // title
//     'OK'                            // buttonName
// );

//     currentLocation = navigator.geolocation.getCurrentPosition(onSuccess, onError, { //
//         frequency: 30000,
//         enableHighAccuracy: true

//     });

// });


