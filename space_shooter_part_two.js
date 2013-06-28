/**
 * Initialize the Game and start it.
 */
var game = new Game();
var gamespeed = 3;
var collided = false;
var gameRunning = false;
var ctx;
var canvas;
var gameLoop; // Game loop time interval.
var titleFontSize = "bold 48px Georgia";//Set title font size
var contentFontSize = "normal 24px Arial";//Set content font size
var teamFontSize = "normal 18px Verdana";

function init() {

	if(game.init())
		TitleMenu();
		//game.start();
		
}

	var death = new Audio("deathsound.mp3");
		death.load();
	var jump = new Audio("jumpsound.mp3");
		jump.load();
		
function jsound(){
		
	jump.play();
			
}
function deathsound(){
	death.play();
}


// http://www.tutorializing.com/code/jquery/Simple-Way-To-Make-A-Game-Using-HTML5-Canvas
function TitleMenu() {
	var countMenu = 0;
	var canvas = document.getElementById('menu');
	if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        if( countMenu <= 0 )
        	gameLoop = setInterval(drawMenu, 100);
  		countMenu = 1;
        window.addEventListener('keydown', whatKey, true);
    }
}

function drawMenu() {
  
        // Clear the board.
        ctx.clearRect(0, 0, 600, 385);
        
		// Fill the board.
		ctx.fillStyle = "yellow";
        ctx.fillRect(0, 0, 600, 385);

        ctx.font = titleFontSize;
        ctx.fillStyle = "blue";
        ctx.textAlign = 'center';
        ctx.fillText("Gut Run!", 300, 200);
  
		ctx.font = teamFontSize;
        ctx.fillStyle = "blue";
        ctx.textAlign = 'center';
        ctx.fillText("Waiting 4 David (Team 4)", 300, 75);

        ctx.font = teamFontSize;
        ctx.fillStyle = "blue";
        ctx.textAlign = 'center';
        ctx.fillText("Presents", 300, 125);

        ctx.font = contentFontSize;
        ctx.fillStyle = "red";
        ctx.textAlign = 'center';
        ctx.fillText("Press Spacebar to Start Game", 300, 300); 



}

    function whatKey(evt) {

    	var menCount = 0;
  
        switch (evt.keyCode) {
          // space bar.
        case 32:
        	if (!gameRunning){
        	gameRunning = true;
        	clearInterval(gameLoop);
        	if( menCount <= 0 )
        		ctx.clearRect(0, 0, 600, 385);
        	menCount = 1;
          	game.start();}
          	//clearInterval(gameLoop);
          	break;
        }
      }

/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a 
 * singleton.
 */
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.spaceship = new Image();
	this.bullet = new Image();
	this.background2 = new Image();
	this.background3 = new Image();
	this.carrot = new Image();

	// Ensure all images have loaded before starting the game
	var numImages = 6;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.background2.onload = function() {
		imageLoaded();
	}
	this.background3.onload = function() {
		imageLoaded();
	}
	this.spaceship.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.carrot.onload=function() {
		imageLoaded();
	}

	// Set images src
	this.background.src = "imgs/bg.png";
	this.spaceship.src = "imgs/BigBoy2.png";
	this.bullet.src = "imgs/bullet.gif";
	this.background2.src = "imgs/lavabg.jpg";
	this.background3.src = "imgs/skybg.jpg";
	this.carrot.src = "imgs/Carrot.gif";
}


/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up defualt variables
 * that all child objects will inherit, as well as the defualt
 * functions. 
 */
function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
	this.move = function() {
	};
}


/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */
function Background() {
	this.speed = gamespeed; // Redefine speed of the background for panning

	// Implement abstract function
	this.draw = function() {
		// Pan background
		this.x -= this.speed;
		switch (gamespeed % 3){
			case 0: 
				this.context.drawImage(imageRepository.background, this.x, this.y);
				// Draw another image at the top edge of the first image
				this.context.drawImage(imageRepository.background, this.x + this.canvasWidth, this.y);
				break;
			case 1:
				this.context.drawImage(imageRepository.background2, this.x, this.y);
				// Draw another image at the top edge of the first image
				this.context.drawImage(imageRepository.background2, this.x + this.canvasWidth, this.y);
				break;
			case 2:
				this.context.drawImage(imageRepository.background3, this.x, this.y);
				// Draw another image at the top edge of the first image
				this.context.drawImage(imageRepository.background3, this.x + this.canvasWidth, this.y);
				break;
			}

		// If the image scrolled off the screen, reset
		if (this.x + this.canvasWidth <= 0)
			this.x = 0;
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


/**
 * Creates the Bullet object which the ship fires. The bullets are
 * drawn on the "main" canvas.
 */
function Bullet() {	
	this.alive = false; // Is true if the bullet is currently in use

	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	/*
	 * Uses a "drity rectangle" to erase the bullet and moves it.
	 * Returns true if the bullet moved off the screen, indicating that
	 * the bullet is ready to be cleared by the pool, otherwise draws
	 * the bullet.
	 */
	this.draw = function() {
		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.x -= this.speed;
		if (this.x <= 0 - this.width) {
			return true;
		}
		else {
			this.context.drawImage(imageRepository.bullet, this.x, this.y);
		}
	};

	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
}
Bullet.prototype = new Drawable();


/**
 * Custom Pool object. Holds Bullet objects to be managed to prevent
 * garbage collection. 
 * The pool works as follows:
 * - When the pool is initialized, it populates an array with 
 *   Bullet objects.
 * - When the pool needs to create a new object for use, it looks at
 *   the last item in the array and checks to see if it is currently
 *   in use or not. If it is in use, the pool is full. If it is 
 *   not in use, the pool "spawns" the last item in the array and 
 *   then pops it from the end and pushed it back onto the front of
 *   the array. This makes the pool have free objects on the back 
 *   and used objects in the front.
 * - When the pool animates its objects, it checks to see if the 
 *   object is in use (no need to draw unused objects) and if it is, 
 *   draws it. If the draw() function returns true, the object is 
 *   ready to be cleaned so it "clears" the object and uses the 
 *   array function splice() to remove the item from the array and 
 *   pushes it to the back.
 * Doing this makes creating/destroying objects in the pool 
 * constant.
 */
function Pool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
	var pool = [];

	/*
	 * Populates the pool array with Bullet objects
	 */
	this.init = function() {
		for (var i = 0; i < size; i++) {
			// Initalize the bullet object
			var bullet = new Bullet();
			bullet.init(0,0, imageRepository.bullet.width,
			            imageRepository.bullet.height);
			pool[i] = bullet;
		}
	};
	
	this.isAlive = function(i){
		return pool[i].alive;
	};
	
	this.x = function(x){
		return pool[x].x;
	};
	this.y = function(x){
		return pool[x].y;
	};
	
	this.setSpeed = function(x){
		pool[x].speed = gamespeed;
	};
	
	this.width = imageRepository.bullet.width;
	
	this.height =imageRepository.bullet.height;
	
	/*
	 * Grabs the last item in the list and initializes it and
	 * pushes it to the front of the array.
	 */
	this.get = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}	
	
	/* CARROT OBJECT------------------------------------------------------ */
	
	
	function Carrot() {	
	this.alive = false; // Is true if the bullet is currently in use

	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed) {
		
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	/*
	 * Uses a "drity rectangle" to erase the bullet and moves it.
	 * Returns true if the bullet moved off the screen, indicating that
	 * the bullet is ready to be cleared by the pool, otherwise draws
	 * the bullet.
	 */
	this.draw = function() {

		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.x -= this.speed;
		if (this.x <= 0 - this.width) {
			return true;
		} else if (game.ship.x -10 < this.x + imageRepository.carrot.width  && game.ship.x + 40 > this.x &&
    			game.ship.y+10 < this.y + imageRepository.carrot.height && game.ship.y + 40 > this.y){
    			
    			if (game.ship.invincible == false){
    				game.ship.carrotsCollected++;
    			}
    			game.ship.score+=10;
    		return true;		
    	}
		else {
			this.speed = gamespeed;
			this.context.drawImage(imageRepository.carrot, this.x, this.y);
			
		}
	};

	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
}
Carrot.prototype = new Drawable();

/* FIRE CARROTS */

function cPool(maxSize) {
	var csize = maxSize; // Max bullets allowed in the pool
	var cpool = [];

	/*
	 * Populates the pool array with Bullet objects
	 */
	this.init = function() {
		for (var i = 0; i < csize; i++) {
			// Initalize the bullet object
			var bullet = new Carrot();
			bullet.init(0,0, imageRepository.carrot.width,
			            imageRepository.carrot.height);
			cpool[i] = bullet;
		}
	};
	
	this.isAlive = function(i){
		return cpool[i].alive;
	};
	
	this.x = function(x){
		return cpool[x].x;
	};
	this.y = function(x){
		return cpool[x].y;
	};
	
	this.setSpeed = function(x){
		cpool[x].speed = gamespeed;
	};
	
	this.width = imageRepository.carrot.width;
	
	this.height =imageRepository.carrot.height;
	
	/*
	 * Grabs the last item in the list and initializes it and
	 * pushes it to the front of the array.
	 */
	this.get = function(x, y, speed) {
		
		if(!cpool[csize - 1].alive) {
			cpool[csize - 1].spawn(x, y, speed);
			cpool.unshift(cpool.pop());
		
			
		}
	};


	/*
	 * Draws any in use Bullets. If a bullet goes off the screen,
	 * clears it and pushes it to the front of the array.
	 */
	this.animate = function() {
		for (var i = 0; i < csize; i++) {
			// Only draw until we find a bullet that is not alive
			if (cpool[i].alive) {
				if (cpool[i].draw()) {
					cpool[i].clear();
					cpool.push((cpool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}

function gameTick(){
	
	if (game.ship.carrotsCollected == 10){
		game.ship.invincible = true;
	}
	if (game.ship.invincible){
		game.ship.counter50++;
		game.ship.carrotsCollected = 0;
		
	}
	if (game.ship.counter50 >= 200){
		game.ship.counter50 = 0;
		game.ship.invincible = false;
	}
	game.ship.score += (1);
	if (game.ship.score > (1000 * gamespeed) - 2000) {
		gamespeed += 1;
		
		//this will hopefully fix the cloud speed issue when level switch
		
		var i = 0;
		for (var i =0; i< 30; i++){
			if(game.ship.bulletPool.isAlive(i)){
				game.ship.bulletPool.setSpeed(i);
			}
		}
		
		game.background.speed = gamespeed;
	}

		
}

function updateShip(){
	//game.ship.speed += .05 * (this.gamespeed);
	if (this.gamespeed == 1){
		game.ship.speed += .05;
	} else if (this.gamespeed > 1 && this.gamespeed <= 9){
		game.ship.speed += .05 * (this.gamespeed - 1);
	} else if (this.gamespeed >= 10) {
		game.ship.speed += .2;
	}
	game.ship.y += game.ship.speed;
	if (game.ship.y >= game.ship.canvasHeight - game.ship.height-60 && game.ship.status == 0){
		game.ship.y = game.ship.canvasHeight - game.ship.height-60;
	} else if (game.ship.y >= game.ship.canvasHeight - game.ship.height - 40 && game.ship.status == 1){
		game.ship.y = game.ship.canvasHeight - game.ship.height - 40;
	}
	var i = 0;

	//console.log(game.ship.bulletPool.pool.isAlive(i));
	if (!game.ship.invincible){
	if (!collided){
		while (game.ship.bulletPool.isAlive(i) && !collided){
			if (game.ship.x -10 < game.ship.bulletPool.x(i) + imageRepository.bullet.width -20  && game.ship.x + 40 > game.ship.bulletPool.x(i)+20 &&
    			game.ship.y+10 < game.ship.bulletPool.y(i) + imageRepository.bullet.height - 5 && game.ship.y + 40 > game.ship.bulletPool.y(i)+10 ){
    			collided = true;
    			deathsound();
    			game.oAudio.pause();
    			alert("You died! Your score was: " + game.ship.score);
    			death.pause();
 	 	  		location.reload();	
    			//we're touching
    
    		}
    		i++;		
		}
	}
	}
	/*while (game.ship.bulletPool.isAlive(i)){
			if (game.ship.x -10 < game.ship.carrotPool.x(i) + imageRepository.carrot.width  && game.ship.x + 40 > game.ship.carrotPool.x(i) &&
    			game.ship.y+10 < game.ship.carrotPool.y(i) + imageRepository.carrot.height && game.ship.y + 40 > game.ship.carrotPool.y(i) ){
    			//we're touching
    			game.ship.score+=100;
    
    		}
    		i++;		
		}*/
	
	
	
	//game.ship.context.clearRect(0, 0, 600, 385);
	//game.ship.context.drawImage(imageRepository.spaceship, this.x, this.y)
}


/**
 * Create the Ship object that the player controls. The ship is
 * drawn on the "ship" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Ship() {
	this.counter50=0;
	this.speed = 0;
	this.bulletPool = new Pool(30);
	this.bulletPool.init();
	this.carrotPool = new cPool(30);
	this.carrotPool.init();
	this.status = 0;
	this.score = 0;
	var fireRate = 48;
	var counter = 0;
	var counter1 = 0;
	var counter2 = 0;
	this.invincible = false;
	this.carrotsCollected =0;
	this.draw = function() {
		game.ship.context.clearRect(0, 0, 600, 385);
		game.shipContext.font="30px Arial";
		game.shipContext.fillText("Calories Burned: " + game.ship.score, 10, 40);
		game.shipContext.fillText("Level: " + (gamespeed - 2), 10, 80);
		if (this.invincible){
			game.shipContext.fillText("You are now invincible!", 200, 80);
			game.shipContext.fillText( Math.floor((10-(game.ship.counter50 * 50)/1000)) + " Seconds left", 200, 120);
		}
		
		if (counter2 < 10){
			game.ship.context.drawImage(imageRepository.spaceship,0,0,50,50,this.x, this.y,50,50);
			counter2 += 1;
			
		} else if (counter2 < 20){
			this.context.drawImage(imageRepository.spaceship,50,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
			
		} else if (counter2 < 30){
			this.context.drawImage(imageRepository.spaceship,100,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
		
		} else if (counter2 < 40){
			this.context.drawImage(imageRepository.spaceship,150,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
	
		}else if (counter2 < 50){
			this.context.drawImage(imageRepository.spaceship,200,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
			
		} else if (counter2 < 60){
			this.context.drawImage(imageRepository.spaceship,250,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
		
		} else if (counter2 < 70){
			this.context.drawImage(imageRepository.spaceship,300,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
	
		} else if (counter2 < 80){
			this.context.drawImage(imageRepository.spaceship,350,0,50,50, this.x, this.y,50,50);
			counter2 += 1;
	
		}
		
		if (counter2 >=80){
			counter2 = 0;
		}
		
	};
	this.move = function() {	
		counter++;
		counter1++;
		//counter3++;
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) {
			// The ship moved, so erase it's current image so it can
			// be redrawn in it's new location
			this.context.clearRect(this.x, this.y, this.width, this.height);

			// Update x and y according to the direction to move and
			// redraw the ship. Change the else if's to if statements
			// to have diagonal movement.
			if (KEY_STATUS.up && this.y>=275) {
				//this.y -= this.speed
				jsound();
				this.speed = -5;

						
			} 
				
		}	
		

		if (counter >= fireRate * 7.5/gamespeed) {
			this.fire();
			counter = 0;
		}
		
	};

	/*
	 * Fires two bullets
	 */
	this.fire = function() {
		if (Math.floor((Math.random()*10)+1) > 5){
			this.bulletPool.get(650, 295, gamespeed);
			this.carrotPool.get(650, 240, gamespeed);
		} else {
			this.bulletPool.get(650,240, gamespeed);
			this.carrotPool.get(650,295,gamespeed);
		}
	};
}
Ship.prototype = new Drawable();


 /**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects. 
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on browsers that do not support the canvas.
	 */
	
	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		var timer = setInterval(updateShip, 10);
		var gametimer = setInterval(gameTick, 50);
		this.oAudio = document.getElementById('theme');
		// Test to see if canvas is supported. Only need to
		// check one canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;

			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;
			
			Carrot.prototype.context = this.mainContext;
			Carrot.prototype.canvasWidth = this.mainCanvas.width;
			Carrot.prototype.canvasHeight = this.mainCanvas.height;

			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0

			// Initialize the ship object
			this.ship = new Ship();
			// Set the ship to start near the bottom middle of the canvas
			var shipStartX = this.shipCanvas.width/4 - 50;
			var shipStartY = this.shipCanvas.height-20 - 100;
			this.ship.init(shipStartX, shipStartY, 50,
			               50);

			return true;
		} else {
			return false;
		}
	};

	// Start the animation loop
	this.start = function() {
		//this.ship.draw();
		animate();
	};
}


/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	game.background.draw();
	game.ship.move();
	game.ship.bulletPool.animate();
	game.ship.carrotPool.animate();
	game.ship.draw(); 
}


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}


/**	
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop, 
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();