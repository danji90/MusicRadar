// Globals

Google_key = "AIzaSyDQVpoQl_Qs9sX8mElHOOvWKK5_n8HKDFw";

client_id = "UPDPWFAPNQMDYOGZK3C5RWLAWZBVCH23EDMGCXWNMXEEAKXN";

client_secret = "0JCC2M4SHSIXTYPLDSCS1A2EO2QYDFZ24RMMAFCHV2WAQRA5";

var venues;

// Refresh Button

$(document).on("click", "#refresh", function(e) {
    //Prevent default behaviour
    e.preventDefault();

    //1. Get Current Location
    var geoLocURL = "https://www.googleapis.com/geolocation/v1/geolocate?key="+Google_key;

    $.post(geoLocURL,
        function (response) {

            // Convert date for URL
            var d = new Date();
            function convertDate(date) {
                var yyyy = date.getFullYear().toString();
                var mm = (date.getMonth()+1).toString();
                var dd  = date.getDate().toString();
                var mmChars = mm.split('');
                var ddChars = dd.split('');
                var ddChars = dd.split('');
                return yyyy + (mmChars[1]?mm:"0"+mmChars[0]) + (ddChars[1]?dd:"0"+ddChars[0]);
            };

            var date = convertDate(d);

            lat = response.location.lat;
            lng = response.location.lng;

            call_url = "https://api.foursquare.com/v2/venues/search?ll="+lat+","+lng+"&categoryId=4bf58dd8d48988d1e5931735&radius=1000&client_id="+client_id+"&client_secret="+client_secret+"&v=" + date;

            $.getJSON(call_url,
                function (data) {
                    // Process Response from FourSquare API Call
                    venues = data.response.venues;
                    // Sort list items by checkInsCount
                    venues.sort(function(a, b) {
                        return b.stats.checkinsCount - a.stats.checkinsCount;
                    });
                    console.log(venues);
                    //Remove previous venues
                    $('#venues_list li').remove();
                    //Add new venues to the list
                    $.each(venues, function(index,venue) {
                        $('#venues_list').append(
                            '<li><a id="to_details" href="#">'+venue.name+
                            '<span id="'+index+'" class="ui-li-count">'+venue.stats.checkinsCount+'</span>'+
                            '</a></li>');
                    });
                    //Refresh list content
                    $('#venues_list').listview('refresh');
                });
        })
});


$(document).on('pagebeforeshow','#home', function () {
    $(document).on('click','#to_details',function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        //Store the venue ID
        currentVenue = venues[e.target.children[0].id];
        //Change to Details Page
        $.mobile.changePage("#details");
    })
});

//Update Details Page
$(document).on('pagebeforeshow','#details', function (e) {
    e.preventDefault();
    //console.log(currentVenue);

    $('#venueName').text(currentVenue.name);
    $('#venueCity').text('City: '+currentVenue.location.city);
    $('#venueState').text('State: '+currentVenue.location.state);
    $('#venueCountry').text('Country: '+currentVenue.location.country);
    $('#venueDistance').text('Distance from user: '+currentVenue.location.distance);
    $('#venuePopularity').text('Popularity: '+currentVenue.stats.checkinsCount +" check-in(s), " + currentVenue.stats.usersCount + " user(s), " + currentVenue.stats.tips + " tip(s)");

});

$(document).on('click','#mapView', function (e) {
    e.preventDefault();

    var cvLat = currentVenue.location.lat;
    var cvLon = currentVenue.location.lng;

    var defaultLatLng = new google.maps.LatLng(cvLat, cvLon);

    console.log(defaultLatLng)

    drawMap(new google.maps.LatLng(cvLat, cvLon));

    function drawMap(defaultLatLng) {
        var myOptions = {
            zoom: 14,
            center: {lat: cvLat, lng: cvLon},
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        console.log(myOptions)
        var map = new google.maps.Map(document.getElementById("map"), myOptions);
        // Add an overlay to the map of current lat/lng
        var marker = new google.maps.Marker({
            position: defaultLatLng,
            map: map,
            title: currentVenue.name
        });

        google.maps.event.addListenerOnce(map, 'idle', function(){
            // do something only the first time the map is loaded
            google.maps.event.trigger(map, 'resize');
        });

        //var venueCoordinates = cvLat + "," + cvLon;
        //console.log(venueCoordinates)

        $.mobile.changePage("#mapPage");
    }
})
