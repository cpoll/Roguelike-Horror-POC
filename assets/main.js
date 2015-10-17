var Game =  {
    _display: null,
    init: function() {
        // Any necessary initialization will go here.
        this._display = new ROT.Display({width: 80, height: 30});
    },
 
	getDisplay: function() {
        return this._display;
    }
}

window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        //TODO: Not supported
    } else {
        // Initialize the game
        Game.init();
        // Add the container to our HTML page
        document.body.appendChild(Game.getDisplay().getContainer());
		
		Game._generateMap();
		Game._drawWholeMap();
		
		setInterval(function(){
			Game._loop();
		}, 50);
    }
}

TileType = {
	Floor: "Floor",
	Wall: "Wall"
}

Game.map = {};
Game.map.tiles = {};
Game.map.getTile = function getTile(x, y){
	return this.tiles[x + ',' + y]
}
Game.map.setTile = function setTile(x, y, tile){
	this.tiles[x + ',' + y] = tile;
}


Game._loop = function loop(){
	this._drawWholeMap();
}

Game._generateMap = function() {
 
    var generatorCallback = function generatorCallback(x, y, value) {
        var key = x+","+y;
		if (!value) { //Floor 
			this.map.tiles[key] = new FloorTile();
		}
        else {
			this.map.tiles[key] = new ShiftingWallTile('#');
		}

        
    }
	
	var generator = new ROT.Map.Uniform(80,30);
    generator.create(generatorCallback.bind(this));
}

Game._drawWholeMap = function(x, y) {
    for (var key in this.map.tiles) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
		
		var tile = this.map.tiles[key];
        this._display.draw(x, y, tile.getCharacter(), tile.getFg(), tile.getBg());
    }
}

var Tile = function Tile(character, fg, bg){
	this.character = character;
	this.fg = fg;
	this.bg = bg;
}

var ShiftingWallTile = function ShiftingWallTile(character)
{
	this.character = character;
	
	this.getFg = function(){
		return 'rgb(' + Math.round( Math.random() * 255 ) + ',0,0)';
	}
	
	this.getBg = function(){
		return 'rgb(' + Math.round( Math.random() * 255 ) + ',0,0)';
	}
	
	this.getCharacter = function(){
		return character;
	}
		
	this.getType = function(){
		return TileType.Wall;
	}
	
}

var FloorTile = function FloorTile()
{
	this._character = '#';
	this._fg = 'rgb(' + Math.round( Math.random() * 50) + ',20,20)';
	this._bg = 'rgb(10,0,0)';
	
	this.getFg = function(){
		return this._fg;
	}
	
	this.getBg = function(){
		return this._bg;
	}
	
	this.getCharacter = function(){
		return this._character;
	}
	
	this.getType = function(){
		return TileType.Floor;
	}
}