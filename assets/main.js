var Game =  {
    _display: null,
	engine: null,
	_scheduler: null,
	_player: null,
	
    init: function() {
		
        // Any necessary initialization will go here.
        this._display = new ROT.Display({width: 80, height: 30});
		document.body.appendChild(Game.getDisplay().getContainer());
		
		this._generateMap();
		this._player = this._createPlayer();
		
		this._scheduler = new ROT.Scheduler.Simple();
        this._scheduler.add(this._player, true);

        this.engine = new ROT.Engine(this._scheduler);
        this.engine.start();
		
		//Init the (hacky) render loop.
		var t = this;
		this._loopInterval = setInterval(function(){
			t._loop();
		}, 50);
    },
 
	getDisplay: function() {
        return this._display;
    }
}

window.onload = function() {
    if (!ROT.isSupported()) {
        //TODO: Not supported
    } else {
        Game.init();
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
Game.map.lightPasses = function (x, y){
	return this.getTile(x, y).getType() === TileType.Floor;
}


Game._loop = function loop(){
	//this._drawWholeMap();
	this._drawVisibleMap();
}

Game._generateMap = function() {
 
    var generatorCallback = function generatorCallback(x, y, value) {
        var key = x+","+y;
		if (!value) { //Floor 
			this.map.tiles[key] = new FloorTile();
		}
        else { //Walls
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
	
	this._player._draw();
}

function lightPasses(x, y){
	return Game.map.lightPasses(x, y);
}

//Draws map as visible by player.
Game._drawVisibleMap = function(){
	this._display.clear();
	var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
	
	fov.compute180(this._player._x, this._player._y, 20, this._player._dir, function(x, y, r, visibility){
		console.log(visibility);
		var tile = Game.map.tiles[x + ',' + y];
		Game._display.draw(x, y, tile.getCharacter(), tile.getFg(), tile.getBg());
	});
	
	
	this._player._draw();
}

Game._createPlayer = function(){
	
	//Loop through the map looking for a floor tile
	for (var key in this.map.tiles) {
		var tile = this.map.tiles[key];
		
        if(tile.getType() === TileType.Floor){
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			var player = new Player(x, y, 4);
			return player;
		}
	}
}

var Player = function (x, y, direction){
	this._x = x;
	this._y = y;
	this._dir = direction;
}

Player.prototype._draw = function(){ //Handled differently than walls/floor for now.
	Game._display.draw(this._x, this._y, "@", "#ff0");
}

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    var code = e.keyCode;
    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    var newKey = newX + "," + newY;
    
	if( Game.map.getTile(newX, newY).getType() !== TileType.Floor){ //Only walk on floor tiles.
		return;
	}

    this._x = newX;
    this._y = newY;
	this._dir = keyMap[code];
    
	Game._drawVisibleMap();
	
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
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
	this._bg = 'rgb(' + Math.round( Math.random() * 50) + ',20,20)';
	this._fg = 'rgb(90,90,90)';
	
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