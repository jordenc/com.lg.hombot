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
	sendCommand('%7b%22COMMAND%22:%22CLEAN_START%22%7d', args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.pause', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%22PAUSE%22%7d', args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.gohome', function( callback, args ){
	sendCommand('%7b%22COMMAND%22:%22HOMING%22%7d', args.device.ipaddress);
	callback( null, true ); 
});

/*
	Zu erst muss eine Login-Session am Hom-Bot generiert werden, dazu sendet man verschlüsselt {\"CONNECT\":\"REQUEST\"} auf Port 4002. 
Anschließend kann auf Port 4000 einer von zahlreichen JSON Befehlen eingeliefert werden: 

Ausgaben: 
{\"CLEANING_TIME\":\"REQUEST\"} = Wie lange reinigt der Hom-Bot bereits
{\"DIAGNOSIS\":{\"INNER_STATE\":\"REQUEST\"}} = 
{\"DIAGNOSIS\":{\"RECENT\":\"REQUEST\"}} = 
{\"DIAGNOSIS\":\"REQUEST\"} = 


Befehle: 
	{\"COMMAND\":\"CLEAN_START\"} = Reinigung starten
{\"NICKNAME\":{\"SET\":\"NAME_DES_HOMBOT\"}} = Dem Hom-Bot einen Namen geben (wahrscheinlich für die Spracherkennung)
{\"COMMAND\":{\"REPEAT\":\"true\"}} = Wiederholte Reinigung ein (oder false für aus)
{\"COMMAND\":{\"TURBO\":\"true\"}} = Turbo-Modus ein (oder false für aus)
{\"COMMAND\":{\"VOICE\":\"MALE\"}} = männliche Sprachausgabe (oder FEMALE für weibliche Sprachausgabe)
{\"COMMAND\":{\"CLEAN_MODE\":\"CLEAN_SPOT\"}} = Spot-Modus
{\"COMMAND\":{\"CLEAN_MODE\":\"CLEAN_SB\"}} = Cell-by-Cell Modus
{\"COMMAND\":{\"CLEAN_MODE\":\"CLEAN_ZZ\"}} = Zick-Zack Modus
{\"JOY\":\""FORWARD"\"} = lässt den Robot vorfährts fahren
{\"JOY\":\""FORWARD_LEFT"\"} = links vorfährts
{\"JOY\":\""FORWARD_RIGHT"\"} = rechts vorfährts
{\"JOY\":\""LEFT"\"} = links 
{\"JOY\":\""RIGHT"\"} = rechts
{\"JOY\":\""BACKWARD"\"} = zurück 
{\"JOY\":\""BACKWARD_LEFT"\"} = links zurück
{\"JOY\":\""BACKWARD_RIGHT"\"} = rechtszurück
{\"JOY\":\""RELEASE"\"} = Steuerung beenden?
	{\"COMMAND\":\"HOMING\"} = In die Ladestation fahren
	{\"COMMAND\":\"PAUSE\"} = Reinigung pausieren
{\"BLACKBOX\":\"REQUEST_ABSTRACT\"} = liefert verschiedene Informationen (Firmware-Version, Batterie-Stand, usw.) zurück, vermutlich auch die aktuelle Karte
{\"DIAGNOSIS\":\"STOP\"} = Diagnose beenden

Session:
{\"CONNECT\":\"REQUEST\"} = JSON Session starten (auf Port 4002!)
{\"SESSION\":\"ALIVE\"} = JSON Session aufrechthalten

*/

Homey.manager('flow').on('action.turbo', function( callback, args ){
	
	var cmd = encodeURI('{\"COMMAND\":{\"TURBO\":\"true\"}})';
	sendCommand(cmd, args.device.ipaddress);
	callback( null, true ); 
});

//

function sendCommand (cmd, hostIP) {

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
	  });
	}).on('error', function(e) {
	  Homey.log("Got error: " + e.message);
	});

	Homey.log("done");
	
}