document.addEventListener('DOMContentLoaded', function() {
    // Select the existing canvas in the HTML
    var canvas = document.getElementById("game-canvas");
    var ctx = canvas.getContext("2d");

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
	// Set target FPS and frame duration
	const targetFPS = 60;
	const frameDuration = 1000 / targetFPS; // 16.67ms for 60fps

	// Background image
	var bgReady = false;
	var bgImage = new Image();
	bgImage.onload = function () {
		bgReady = true;
		console.log("Background image loaded");
		checkAllAssetsLoaded();
	};
	bgImage.src = "images/background-v2.png"; // Ensure this path is correct

	// Hero image
	var heroReady = false;
	var heroImage = new Image();
	heroImage.onload = function () {
		heroReady = true;
		console.log("Hero image loaded");
		checkAllAssetsLoaded();
	};
	heroImage.src = "images/hero.png"; // Ensure this path is correct

	// Monster image
	var monsterReady = false;
	var monsterImage = new Image();
	monsterImage.onload = function () {
		monsterReady = true;
		console.log("Monster image loaded");
		checkAllAssetsLoaded();
	};
	monsterImage.src = "images/monster.png"; // Ensure this path is correct

	// Game objects with relative positions and sizes
	var hero = {
		baseSpeed: 270, // original movement speed in pixels per second
		widthPercent: 0.07, // width as a percentage of canvas width
		heightPercent: 0.07, // height as a percentage of canvas height
		xPercent: 0.5, // Horizontal position as percentage of canvas width
		yPercent: 0.5  // Vertical position as percentage of canvas height
	};
	var monster = {
		widthPercent: 0.07, // width as a percentage of canvas width
		heightPercent: 0.07, // height as a percentage of canvas height
		xPercent: 0.3, // Horizontal position as percentage of canvas width
		yPercent: 0.3  // Vertical position as percentage of canvas height
	};
	var monstersCaught = 0;

	// Minimum padding percentage for monster spawn and movement restriction
	var paddingPercent = 0.12; // 12% padding for monster spawn
	var movementPaddingPercentX = 0.087; // 8.7% padding from edges for hero movement
	var movementPaddingPercentY = 0.105; // 11.2% padding from edges for hero movement
	var minDistancePercent = 0.2; // Minimum distance of 20% of the canvas dimension between hero and monster

	// Handle keyboard controls
	var keysDown = {};
	addEventListener("keydown", function (e) { keysDown[e.keyCode] = true; }, false);
	addEventListener("keyup", function (e) { delete keysDown[e.keyCode]; }, false);

	// Check if all assets have loaded before signaling readiness
	function checkAllAssetsLoaded() {
		if (bgReady && heroReady && monsterReady) {
			console.log("All assets are loaded, signaling readiness...");
			// Signal that the game is fully loaded and ready
			document.dispatchEvent(new Event('gameLoaded'));
		} else {
			console.log("Waiting for all assets to load...");
		}
	}

	// Reset the game when the player catches a monster
	function reset() {
		const minDistance = Math.min(canvas.width, canvas.height) * minDistancePercent;

		function calculateDistance(x1, y1, x2, y2) {
			const dx = x2 - x1;
			const dy = y2 - y1;
			return Math.sqrt(dx * dx + dy * dy);
		}

		// Find a valid spawn position for the monster
		do {
			monster.xPercent = paddingPercent + Math.random() * (1 - 2 * paddingPercent);
			monster.yPercent = paddingPercent + Math.random() * (1 - 2 * paddingPercent);
			calculatePosition(monster);
		} while (calculateDistance(hero.x, hero.y, monster.x, monster.y) < minDistance);
	}

	// Calculate absolute position based on percentage
	function calculatePosition(obj) {
		obj.x = obj.xPercent * canvas.width;
		obj.y = obj.yPercent * canvas.height;
	}

	// Calculate hero's scaled speed based on canvas dimensions
	function getScaledSpeed() {
		const scale = canvas.height / 352; // Scale based on the canvas height for consistency
		return hero.baseSpeed * scale;
	}

	// Update game objects
	function update(modifier) {
		const scaledSpeed = getScaledSpeed();

		const xMinBoundary = movementPaddingPercentX + (hero.widthPercent / 2);
		const xMaxBoundary = 1 - movementPaddingPercentX - (hero.widthPercent / 2);
		const yMinBoundary = movementPaddingPercentY + (hero.heightPercent / 2);
		const yMaxBoundary = 1 - movementPaddingPercentY - (hero.heightPercent / 2);

		if (38 in keysDown && hero.yPercent > yMinBoundary) {
			hero.yPercent -= (scaledSpeed * modifier) / canvas.height; // up
		}
		if (40 in keysDown && hero.yPercent < yMaxBoundary) {
			hero.yPercent += (scaledSpeed * modifier) / canvas.height; // down
		}
		if (37 in keysDown && hero.xPercent > xMinBoundary) {
			hero.xPercent -= (scaledSpeed * modifier) / canvas.width; // left
		}
		if (39 in keysDown && hero.xPercent < xMaxBoundary) {
			hero.xPercent += (scaledSpeed * modifier) / canvas.width; // right
		}

		calculatePosition(hero);
		calculatePosition(monster);

		if (
			hero.x <= (monster.x + monster.widthPercent * canvas.width)
			&& monster.x <= (hero.x + hero.widthPercent * canvas.width)
			&& hero.y <= (monster.y + monster.heightPercent * canvas.height)
			&& monster.y <= (hero.y + hero.heightPercent * canvas.height)
		) {
			++monstersCaught;
			reset();
		}
	}

	// Draw everything with scaling
	function render() {
		ctx.imageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;

		if (bgReady) {
			ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
		}

		const heroWidth = hero.widthPercent * canvas.width;
		const heroHeight = hero.heightPercent * canvas.height;
		const monsterWidth = monster.widthPercent * canvas.width;
		const monsterHeight = monster.heightPercent * canvas.height;

		if (heroReady) {
			ctx.drawImage(heroImage, Math.round(hero.x - heroWidth / 2), Math.round(hero.y - heroHeight / 2), Math.round(heroWidth), Math.round(heroHeight));
		}

		if (monsterReady) {
			ctx.drawImage(monsterImage, Math.round(monster.x - monsterWidth / 2), Math.round(monster.y - monsterHeight / 2), Math.round(monsterWidth), Math.round(monsterHeight));
		}

		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = `${Math.round(20 * (canvas.height / 480))}px Helvetica`;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Goblins caught: " + monstersCaught, 10, 10);
	}

	// The main game loop with native 60fps using requestAnimationFrame
	function main() {
		var now = Date.now();
		var delta = now - then;

		update(delta / 1000); // Update with delta in seconds
		render();

		then = now;
		requestAnimationFrame(main); // Continue the loop naturally at ~60fps
	}

	// Initialize the game loop
	var then = Date.now();
	reset();
	console.log("Game initialized. Starting main loop...");
	main();
});