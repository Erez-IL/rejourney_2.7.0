// When the user views the Journey Info page
$('#rejourney').on('pageshow', function(){
    console.log("Inside rejourney pageShow");
    // -------------------------------Plotthe Journey and Photos on the Google Maps---------------------------------------------
    // Pull Track Points for Journey from DB
    getTrackPointsForSelectedJourney();

    // Set up the Google Map
    var map = null;
    var mapOptions = {
        zoom: 15,
        // center: new google.maps.LatLng(37.788861,-122.411586), //HB address
        center: selectedJourneyCoords[0],  //Start at first point in the journey on the map
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    // google.maps.event.addDomListener(window, 'load', initialize);

    console.log('Map object:' + map);

   // Plot the GPS entries as a line on the Google Map
    var journeyPath = new google.maps.Polyline({
      path: selectedJourneyCoords,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    // // Apply the line to the map
    journeyPath.setMap(map);

    // // Plot the GPS entries from photos as a circles on the Google Map
    // var photoMarkers = new google.maps.SymbolPath.CIRCLE({  //var photoMarkers = new google.maps.Marker({
    //   path: photoCoords,
    //   fillcolor: "gold",
    //   fillopacity: 1,
    // });
    // Apply the journey line and photo markers to the map
    // journeyPath.setMap(map);
    // photoMarkers.setMap(map);

});
 // Pull Photo Points for Journey from DB
// If (Camera.sourceType = Camera.PictureSourceType){
//     PHOTOLIBRARY or Camera.PictureSourceType.SAVEDPHOTOALBUM, then a photo chooser dialog is shown, from which a photo from the album can be selected.
// }

//  $("#slideShow").on('click', function()
// {
//     $("#slideshow").cycle({fx: 'fade', timeout: 500});
//     $('#zoom').cycle({
//         fx:    'zoom',
//         sync:  false,
//         delay: -2000
//     });
// });


function gps_distance(lat1, lon1, lat2, lon2)
{
    // http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}