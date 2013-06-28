/***************
 * PART TWO - Create the player controlled ship and it's
 * properties (move and shoot)
 ***************/

/* NOTES TO REMEMBER
 * 1. Drawing to the canvas is expensive. Try to reuse as much as the image as you can for each frame.
 */
 
/* RESOURCES
 * 1. http://gamedev.tutsplus.com/tutorials/implementation/object-pools-help-you-reduce-lag-in-resource-intensive-games/
 * 2. http://gameprogrammingpatterns.com/object-pool.html
 * 3. http://www.slideshare.net/ernesto.jimenez/5-tips-for-your-html5-games
 * 4. http://www.kontain.com/fi/entries/94636/ (quote on performace)
 * 5. http://code.bytespider.eu/post/21438674255/dirty-rectangles
 * 6. http://www.html5rocks.com/en/tutorials/canvas/performance/
 */


/**
 * Initialize the Game and start it.
 */
var game = new Game();
var gamespeed = 1;

function init() {

	if(game.init())
		game.start();
		
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

	// Ensure all images have loaded before starting the game
	var numImages = 5;
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

	// Set images src
	this.background.src = "imgs/bg.png";
	this.spaceship.src = "imgs/ship.gif";
	this.bullet.src = "imgs/bullet.gif";
	this.background2.src = "imgs/bg.jpg";
	this.background3.src = "imgs/skybg.jpg";
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
		if (this.x <= 0 - this.height) {
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

	/*
	 * Used for the ship to be able to get two bullets at once. If
	 * only the get() function is used twice, the ship is able to
	 * fire and only have 1 bullet spawn instead of 2.
	 */
	this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size - 1].alive && 
		   !pool[size - 2].alive) {
				this.get(x1, y1, speed1);
				this.get(x2, y2, speed2);
			 }
	};

	/*
	 * Draws any in use Bullets. If a bullet goes off the screen,
	 * clears it and pushes it to the front of the array.
	 */
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

function gameTick(){
	game.ship.score += (1);
	if (game.ship.score > 1000 * gamespeed) {
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
	} else if (this.gamespeed > 1 && this.gamespeed <= 4){
		game.ship.speed += .05 * (this.gamespeed - 1);
	} else {
		game.ship.speed += .15;
	}
	game.ship.y += game.ship.speed;
	if (game.ship.y >= game.ship.canvasHeight - game.ship.height-60){
		game.ship.y = game.ship.canvasHeight - game.ship.height-60;
	}
	var i = 0;

	//console.log(game.ship.bulletPool.pool.isAlive(i));
	while (game.ship.bulletPool.isAlive(i)){
		if (game.ship.x -10 < game.ship.bulletPool.x(i) + imageRepository.bullet.width -20  && game.ship.x + imageRepository.spaceship.width -10 > game.ship.bulletPool.x(i)+20 &&
    		game.ship.y+10 < game.ship.bulletPool.y(i) + imageRepository.bullet.height - 5 && game.ship.y + imageRepository.spaceship.height -10 > game.ship.bulletPool.y(i)+10 ){
    		deathsound();
    		game.oAudio.pause();
    		alert("You died! Your score was: " + game.ship.score);
    		location.reload();	
    		//we're touching
    
    	}
    	i++;		
	}
	
	//game.ship.context.clearRect(0, 0, 600, 385);
	//game.ship.context.drawImage(imageRepository.spaceship, this.x, this.y)
}


/**
 * Create the Ship object that the player controls. The ship is
 * drawn on the "ship" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Ship() {
	 
	this.speed = 0;
	this.bulletPool = new Pool(30);
	this.bulletPool.init();
	
	this.score = 0;
	var fireRate = 48;
	var counter = 0;
	var counter1 = 0;

	this.draw = function() {
	game.ship.context.clearRect(0, 0, 600, 385);
		game.shipContext.font="30px Arial";
		game.shipContext.fillText("Score: " + game.ship.score, 10, 40);
		game.shipContext.fillText("Level: " + gamespeed, 10, 80);
		this.context.drawImage(imageRepository.spaceship, this.x, this.y);
	};
	this.move = function() {	
		counter++;
		counter1++;
		
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
				
				/*this.y = 245;
				if (this.y <= 245)
					this.y = 245;
					*/
					
			} /*else if (KEY_STATUS.down) {
				//this.y += this.speed
				this.y = this.canvasHeight - this.height - 60;
				if (this.y >= this.canvasHeight - this.height-60) //keep above base line
					this.y = this.canvasHeight - this.height-60;
			}*/

			// Finish by redrawing the ship
			//this.draw();
			
			}
		
		/*if (this.y >= this.canvasHeight - this.height - 60){
			this.y += speed;
		}
		this.context.clearRect(this.x, this.y, this.width, this.height);
		*/
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
		} else {
			this.bulletPool.get(650,240, gamespeed);
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

			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0

			// Initialize the ship object
			this.ship = new Ship();
			// Set the ship to start near the bottom middle of the canvas
			var shipStartX = this.shipCanvas.width/4 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height-20 - imageRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width,
			               imageRepository.spaceship.height);

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