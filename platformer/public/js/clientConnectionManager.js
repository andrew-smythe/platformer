//clientConnectionManager.js

var clientConnectionManager=
{
	socket:null,
	gameState:null,
	
	init: function (game)
	{
		//establish connection 
		this.socket = io.connect();
		this.manager= GameManager;
		this.manager.init();
		
		this.socket.on('update_player_position', function(players)   // Updates the position of the players on the screen
	    { 
	    	clientConnectionManager.manager.players = players;
	    });
	    
	    this.socket.on('return_winning_number', function(number)
	    {
	        // update the winning number on the game manager
	        clientConnectionManager.manager.updateWinningNumber(number);
	    });
	    
	    this.socket.on('player_victory', function(playerName)
	    {
	        // tell the game manager to restart, and that a player has won
	        clientConnectionManager.manager.restart(playerName);
	    });
	    
		/*
		this.socket.on('resp_restart_game', function()   //
										{ 
												clientConnectionManager.gameState.startGame();
										});*/
	},
	
	updatePlayer: function(player)
	{
		this.socket.emit('player_update_position', player);		
		
	},
	
	getWinningNumber: function()
	{
	    this.socket.emit('winning_number');
	},
	
	reportWin: function(player)
	{
	    this.socket.emit('report_win', player);
	},
	
	disconnect: function(player)
	{
	    this.socket.emit('player_disconnect', player);
	}
};


