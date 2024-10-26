// Select the existing canvas in the HTML
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

// Disable image smoothing
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
};
bgImage.src = "images/background-v2.png"; // Ensure this path is correct

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/hero.png"; // Ensure this path is correct

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/monster.png"; // Ensure this path is correct

// Game objects with relative positions and sizes
var hero = {
    baseSpeed: 315, // original movement speed in pixels per second
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
var paddingPercent = 0.12; // 30% padding for monster spawn
var movementPaddingPercentX = 0.087; // 10% padding from edges for hero movement
var movementPaddingPercentY = 0.112; // 10% padding from edges for hero movement
var minDistancePercent = 0.2; // Minimum distance of 10% of the canvas dimension between hero and monster

// Handle keyboard controls
var keysDown = {};
addEventListener("keydown", function (e) { keysDown[e.keyCode] = true; }, false);
addEventListener("keyup", function (e) { delete keysDown[e.keyCode]; }, false);

// Reset the game when the player catches a monster
function reset() {
    //hero.xPercent = 0.5; // center hero horizontally
    //hero.yPercent = 0.5; // center hero vertically
    
	// Calculate the minimum distance in pixels
    const minDistance = Math.min(canvas.width, canvas.height) * minDistancePercent;
	
    // Function to calculate distance between hero and a potential monster spawn
    function calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Loop to find a valid spawn position for the monster
    do {
        // Set monster spawn with minimum padding from edges
        monster.xPercent = paddingPercent + Math.random() * (1 - 2 * paddingPercent);
        monster.yPercent = paddingPercent + Math.random() * (1 - 2 * paddingPercent);

        // Calculate the actual position in pixels
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
    const scaledSpeed = getScaledSpeed(); // Scaled speed for consistent movement

    // Calculate movement boundaries based on hero's size and padding
    const xMinBoundary = movementPaddingPercentX + (hero.widthPercent / 2);
    const xMaxBoundary = 1 - movementPaddingPercentX - (hero.widthPercent / 2);
    const yMinBoundary = movementPaddingPercentY + (hero.heightPercent / 2);
    const yMaxBoundary = 1 - movementPaddingPercentY - (hero.heightPercent / 2);

    // Move hero, respecting movement boundaries
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

    // Recalculate actual positions
    calculatePosition(hero);
    calculatePosition(monster);

    // Check for collision
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
	// Disable image smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
	
	
	// Draw background scaled to canvas size
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    // Calculate dynamic sizes based on canvas dimensions
    const heroWidth = hero.widthPercent * canvas.width;
    const heroHeight = hero.heightPercent * canvas.height;
    const monsterWidth = monster.widthPercent * canvas.width;
    const monsterHeight = monster.heightPercent * canvas.height;

    // Draw hero scaled
    if (heroReady) {
        ctx.drawImage(heroImage, Math.round(hero.x - heroWidth / 2), Math.round(hero.y - heroHeight / 2), Math.round(heroWidth), Math.round(heroHeight));
    }

    // Draw monster scaled
    if (monsterReady) {
        ctx.drawImage(monsterImage, Math.round(monster.x - monsterWidth / 2), Math.round(monster.y - monsterHeight / 2), Math.round(monsterWidth), Math.round(monsterHeight));
    }


	// Score display
	ctx.fillStyle = "rgb(250, 250, 250)";
	// Adjust the scaling factor to make the text smaller (higher divisor)
	ctx.font = `${Math.round(20 * (canvas.height / 480))}px Helvetica`; // Scale font size based on canvas height
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	// Set coordinates to (0, 0) to anchor text to the top-left corner
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
main();