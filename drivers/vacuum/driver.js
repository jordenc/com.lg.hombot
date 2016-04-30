"use strict";

var http = require('http');
var tempIP = '';
var devices = {};

module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {

    Homey.log ('Changed settings: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj));
    
    try {
      changedKeysArr.forEach(function (key) {
        devices[device_data.id].settings[key] = newSettingsObj[key]
      })
      callback(null, true)
    } catch (error) {
      callback(error)
    }

};

module.exports.init = function(devices_data, callback) {
    
    devices_data.forEach(function initdevice(device) {
	    
	    devices[device.id] = device;
	    
	    module.exports.getSettings(device, function(err, settings){
		    devices[device.id].settings = settings;
		});
	 
	});
	
	Homey.log("LG Hombot app - init done");
	
	callback (null, true);
};


module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("LG Hombot app - list_devices tempIP is " + tempIP);
		
		var devices = [{
			name				: tempIP,
			data: {
				id				: tempIP,
			},
			settings: {
				"ipaddress" 	: tempIP
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
	sendCommand('%7b%22COMMAND%22:%22CLEAN_START%22%7d', args.device.ipaddress, callback); 
});

Homey.manager('flow').on('action.pause', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%22PAUSE%22%7d', args.device.ipaddress, callback); 
});

Homey.manager('flow').on('action.gohome', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%22HOMING%22%7d', args.device.ipaddress, callback);
});

Homey.manager('flow').on('action.backward', function( callback, args ){
	sendCommand('%7b%22JOY%22:%22BACKWARD%22%7d', args.device.ipaddress, callback);
});

Homey.manager('flow').on('action.forward', function( callback, args ){
	sendCommand('%7b%22JOY%22:%22FORWARD%22%7d', args.device.ipaddress, callback);
});
Homey.manager('flow').on('action.left', function( callback, args ){
	sendCommand('%7b%22JOY%22:%22LEFT%22%7d', args.device.ipaddress, callback);
});
Homey.manager('flow').on('action.right', function( callback, args ){
	sendCommand('%7b%22JOY%22:%22RIGHT%22%7d', args.device.ipaddress, callback);
});
Homey.manager('flow').on('action.cleanmode', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%7b%22CLEAN_MODE%22:%22' + args.mode + '%22%7d%7d', args.device.ipaddress, callback);
});

Homey.manager('flow').on('action.turbo', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%7b%22TURBO%22:%22' + args.mode + '%22%7d%7d', args.device.ipaddress, callback);
});

Homey.manager('flow').on('action.repeat', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%7b%22REPEAT%22:%22' + args.mode + '%22%7d%7d', args.device.ipaddress, callback);
});


// CONDITIONS:

Homey.manager('flow').on('condition.cleaning', function(callback, args){
	getStatus('JSON_ROBOT_STATE="WORKING"', args.device.ipaddress, callback);
});

Homey.manager('flow').on('condition.reachable', function(callback, args){
	getStatus('JSON_ROBOT_STATE', args.device.ipaddress, callback);
});

Homey.manager('flow').on('condition.charging', function( callback, args ){
	getStatus('JSON_ROBOT_STATE="CHARGING"', args.device.ipaddress, callback);
});

Homey.manager('flow').on('condition.pause', function( callback, args ){
	getStatus('JSON_ROBOT_STATE="PAUSE"', args.device.ipaddress, callback);
});

Homey.manager('flow').on('condition.homing', function( callback, args ){
	getStatus('JSON_ROBOT_STATE="HOMING"', args.device.ipaddress, callback);
});

Homey.manager('flow').on('condition.docking', function( callback, args ){
	getStatus('JSON_ROBOT_STATE="DOCKING"', args.device.ipaddress, callback);
});
//

function sendCommand (cmd, hostIP, callback) {

	Homey.log ("LG Hombot app - sending " + cmd + " to " + hostIP);
	
	http.get({
		  hostname: hostIP,
		  port: 6260,
		  path: '/json.cgi?' + cmd,
		  agent: false
		}, function(res){
		var body = '';
	  res.on('data', function(chunk) {
	    body += chunk;
	    Homey.log("Got data: " + chunk);
	  });
	  res.on('end', function() {
	    Homey.log(body);
	    callback(null, true);
	  });
	}).on('error', function(e) {
	  Homey.log("Got error: " + e.message);
	  callback(e.message, false);
	});

	Homey.log("done");
	
}

function getStatus (cmd, hostIP, callback) {

	Homey.log ("LG Hombot app - get status.txt and compare it to " + cmd + " on " + hostIP);
	
	http.get({
		  hostname: hostIP,
		  port: 6260,
		  path: '/status.txt',
		  agent: false
		}, function(res){
		var body = '';
	  res.on('data', function(chunk) {
	    body += chunk;
	    Homey.log("Got data: " + chunk);
	  });
	  res.on('end', function() {
	    Homey.log(body);
	    
	    if (body.indexOf(cmd) >= 0) {	
		    callback(null, true);
		} else {
			callback(null, false);
		}
	  });
	}).on('error', function(e) {
	  Homey.log("Got error: " + e.message);
	  callback(null, false);
	});

	Homey.log("done");
	
}