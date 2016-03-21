"use strict";

var http = require('http');
var tempIP = '';

module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("LG Hombot app - list_devices tempIP is " + tempIP);
		
		var devices = [{
			data: {
				id			: tempIP,
				ipaddress 	: tempIP
			}
		}];

		callback (null, devices);

	});

	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		Homey.log ( "LG Hombot app - got get_devices from front-end, tempIP =" + tempIP );

		// assume IP is OK and continue
		socket.emit ('continue', null);

	});

	socket.on('disconnect', function(){
		Homey.log("LG Hombot app - User aborted pairing, or pairing is finished");
	})
}

// flow action handlers

Homey.manager('flow').on('action.start', function( callback, args ){
	sendCommand('CLEAN_START', args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.pause', function( callback, args ){
	sendCommand('PAUSE', args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.gohome', function( callback, args ){
	sendCommand('HOMING', args.device.ipaddress);
	callback( null, true ); 
});


//

function sendCommand (cmd, hostIP) {

	Homey.log ("LG Hombot app - sending " + cmd + " to " + hostIP);
	
	http.get({
		  hostname: hostIP,
		  port: 6260,
		  path: '/json.cgi?%7b%22COMMAND%22:%22' + cmd + '%22%7d',
		  agent: false
		}, function(res){
		var body = '';
	  res.on('data', function(chunk) {
	    body += chunk;
	  });
	  res.on('end', function() {
	    Homey.log(body);
	  });
	}).on('error', function(e) {
	  Homey.log("Got error: " + e.message);
	});

	Homey.log("done");
	
}