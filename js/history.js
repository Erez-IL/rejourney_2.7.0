// When the user views the history page
$('#history').on('pageshow', function () {
    // alert('history page show');
    function querySuccess(tx, results) {
        console.log("Query success");
        var qtyJourneys = results.rows.length;
        // alert('results.rows.length' + results.rows.length);
        // alert('qtyJourneys' + qtyJourneys);
        $("#journeys_recorded").html("<strong>" + qtyJourneys + "</strong> journey(s) recorded.");

        console.log('history_journeylist= ' + history_journeylist);
        // Empty the list of recorded tracks
        $("#history_journeylist").empty();

        // Iterate over all of the recorded journeys, populating the list on the history page.
        for(var i=0; i<qtyJourneys; i++){
            var j = results.rows.item(i);
            var el="<li><a href='#rejourney' class='journey_button' journey_id='" + j.id + "' data-ajax='false'>" + j.name + "</a></li>"
            $("#history_journeylist").append($(el));
            console.log('Appending qtyJourneys,' + el);
        }

        // Tell jQueryMobile to refresh the list
        $("#history_journeylist").listview('refresh');
        console.log("listview('refresh')");
    }

    function errorCB(err) {
        console.log("Error processing SQL for journey_info?: " + err.message);
    }

    db.transaction(function(tx) {
        // alert("transaction:" + tx);
        tx.executeSql('SELECT * FROM Journeys', [], querySuccess, errorCB);
    }, errorCB);
});

// When the user clicks a link to view journey info, set/change the photo_id attribute on the journey_info page.
$(document).ready(function() {
    $("#history_journeylist").on('click', "a.journey_button", function(){
        // $("#journey_info").attr("photo_id", $(this).text());
        selectedJourney = $(this).attr("journey_id");
        getAllPhotos(selectedJourney);
        console.log("Clicked on journey_id: " + $(this).attr("journey_id"));
        //Now switch to rejourney page.
    });
});



// When the user views the Journey Info page
$('#journey_info').on('pageshow', function(){
    console.log("Showing the journey info for journey " + current_journey);
    // Find the photo_id of the journey they are viewing
    var key = $(this).attr("photo_id");


    /* Step 1: query for photos, tracks from db
       Step 2: Display on map */

    // Update the Journey Info page header to the journey_id
    $("#journey_info div[data-role=header] h1").text(key);

    // Get all the GPS data for the specific journey and photos
    var journeyData = window.localStorage.getItem(key);
    var photoData = window.localStorage.getItem(key);

    // Turn the stringified GPS journeyData and photoData back into a JS object
    journeyData = JSON.parse(journeyData);
    photoData = JSON.parse(journeyData);
});



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
