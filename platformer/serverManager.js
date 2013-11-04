//serverManager.js

// checks if a player is in the array -- returns the index of the
// player if it is, -1 otherwise
function containsPlayer(arr, player)
{
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].playerName === player.playerName) {
            return i;
        }
    }
    return -1;
}

var serverManager=
{
	port: 8001,
	http: null,
	path: null,
	filesys:null,
	socket: null,
	app: null,	
	socketio: null,	
	players: null,
	
	//file extensions table to serve corresponding content-type to clients
	extensions :	{
						".html": "text/html",
						".css": "text/css",
						".js": "application/javascript",
						".png": "image/png",
						".gif": "image/gif",
						".jpg": "image/jpeg",
						".eot":"font/opentype",
						".ttf":"font/opentype",
						".woff":"font/opentype",
						".svg":"image/svg+xml",
						".mp3":"audio/mpeg",
						".ogg":"audio/ogg"
					},
	
	init: function ()  //is called when server starts
	{		
		this.http = require("http");
		this.path = require("path");
		this.filesys = require("fs");
				
		//create http server
		this.app = this.http.createServer( function(r, s)
									{									
										serverManager.httpRequestHandler(r,s); 
									});
		this.app.listen(this.port);
		
		//create socket listener
		this.socket = require("socket.io");
		this.socketio = this.socket.listen(this.app);
		this.socketio.sockets.on('connection', function (socket) { serverManager.socketEventHandler(socket);} );	
		
		// setup players array
		this.players = new Array();
		
		// get the winning number
		this.winNum = createWinNum();
		        
	},
	
	socketEventHandler: function (socket)
	{		
		socket.on('player_update_position', function (player)
		{
		    // server information
		    var server = serverManager;
		    
		    // find the player's index
		    var playerIndex = containsPlayer(server.players, player);
		    
		    // update or add the player
		    if (playerIndex >= 0) {
		        server.players[playerIndex] = player;
		    }
		    else {
		        server.players.push(player);
		    }
		    
		    // let clients know to update their player list
			server.socketio.sockets.emit('update_player_position', server.players);				
		});	
		
		socket.on('player_disconnect', function (player)
		{
		    // server information
		    var server = serverManager;
		    
		    // find the player's index
		    var playerIndex = containsPlayer(server.players, player);
		    
		    // remove the player if it exists
		    if (playerIndex >= 0) {
		        server.players.splice(playerIndex, 1);
		        // let clients know to update their player list
			    server.socketio.sockets.emit('update_player_position', server.players);
		    }
		});
		
		// client requests the winning number
		socket.on('winning_number', function()
		{
		    // server information
		    var server = serverManager;
		    
		    // emit the winning number
		    server.socketio.sockets.emit('return_winning_number', server.winNum);
		
		});
		
		socket.on('report_win', function(player)
		{
		    // server information
		    var server = serverManager;
		    
		    // update the winning number
		    server.winNum = createWinNum();
		    
		    // emit the winning player's name
		    server.socketio.sockets.emit('player_victory', player.playerName);
		});
        /*
		socket.on('req_game_restart', function ()
		{
			serverManager.socketio.sockets.emit('resp_restart_game');				
		});	*/			
	},	
	
	//*************************************
	httpRequestHandler: function (request, response) //serves pages and files on request
	{	
		// look for a filename in the URL, default to index.html
		var filename = this.path.basename(request.url) || "game.html";
		var ext = this.path.extname(filename);
		var dir = this.path.dirname(request.url).substring(1);
		var localPath =  'public/'; // public folder contains the publicly visible content - index.html and images
		
		if (serverManager.extensions[ext]) 
		{			
			localPath += (dir ? dir + "/" : "") + filename;
			console.log(localPath);
			serverManager.path.exists(localPath, function(exists) 
									{
										if (exists) 
										{
											serverManager.getFile(localPath, serverManager.extensions[ext], response);
										} 
										else 
										{
											response.writeHead(404);
											response.end();
										}
									});
		}
	},
	
	getFile: function (localPath, mimeType, response) 
	{
		this.filesys.readFile(localPath, function(err, contents) 
									{
										if (!err) 
										{
											response.writeHead(200, {
											"Content-Type": mimeType,
											"Content-Length": contents.length
											});
											response.end(contents);
										} else {
											response.writeHead(500);
											response.end();
										}
									}
			);
	},
};

function createWinNum() {
    return (Math.floor(Math.random() * (4) + 2));
}

module.exports = serverManager;
