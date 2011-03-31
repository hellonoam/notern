$(document).ready(function() {
	var client = new simplegeo.PlacesClient('r93v7xccxabwSvjBqyXJF5ZTxHbV8mcL');

	client.getLocation({enableHighAccuracy: true}, function(err, geoPosition) {
		var lat = 52.1984;//geoPosition.coords.latitude;
		var lon = 0.100926;//geoPosition.coords.longitude;
		console.log("latitude " + lat + " longitude " + lon);

		client.search(lat, lon, {}, function(err, data) {
		    if (err) {
		        console.error(err);
		    } else {
		        console.log(JSON.stringify(data));
		    }
		});

		// client.searchFromAddress("St. Edmund College, Cambridge, CB3 0BN, UK", function(err, data) {
		// 	if (err) {
		//         console.error(err);
		//     } else {
		//         console.log(JSON.stringify(data));
		//     }
		// });
	});
});