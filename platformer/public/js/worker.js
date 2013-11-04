importScripts("../socket.io/socket.io.js");

var socket = io.connect();
		
socket.on('update_player_position', function(players)   // Updates the position of the players on the screen
{ 
   	postMessage(players);
});

onmessage = function (task) {
   if (task.text === "update")
	{
	    socket.emit('player_update_position', task.player);	
		alert("aaah");		
	}
	
	else if (task.text === "disconnect")
	{
	    socket.emit('player_disconnect', task.player);
	}
}
