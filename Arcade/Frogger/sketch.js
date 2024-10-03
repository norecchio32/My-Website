let frogX, frogY, frogSize;
let level = 1; // Starting level
let maxCars = 6; // Increased number of cars to match log spawning
let maxLogs = 6; // Maximum number of logs (starts higher for more frequent spawning)
let cars = []; // List to store cars
let logs = []; // List to store logs
let gameOver = false;
let carSpawnInterval = 30; // Reduced interval to spawn more cars
let logSpawnInterval = 30; // Logs spawn twice as frequently as cars
let framesUntilNextCar = 0;
let framesUntilNextLog = 0;
let lanes = [100, 150, 200, 250, 300, 350]; // Predefined lanes for cars
let waterLanes = [450, 500, 550, 600]; // Predefined lanes for logs in the water section
let frogSprite, logSprite, carRightSprite, carLeftSprite; // Variables for sprites
let onLog = null; // To track if the frog is on a log
let highScore = 0; // High score variable
let logCollisionMargin = 10; // The margin to shrink the log bounding box by

function preload() {
  frogSprite = loadImage('assets/frog.png'); // Load the frog sprite
  logSprite = loadImage('assets/log.png'); // Load the log sprite
  carRightSprite = loadImage('assets/carright.png'); // Load the car moving right sprite
  carLeftSprite = loadImage('assets/carleft.png'); // Load the car moving left sprite
}

function setup() {
  createCanvas(700, 800);
  resetGame();
}

function draw() {
  background(0, 150, 0); // Green background for grass

  if (!gameOver) {
    // Draw the road
    fill(50);
    rect(0, 50, width, 350); // Main road section moved up by one grid

    // Draw the safe top row above the water
    fill(0, 150, 0); // Grass color for safe zone
    rect(0, 400, width, 50); // Safe zone just before water

    // Draw the water with 4 rows
    fill(0, 0, 255); // Blue for water
    rect(0, 450, width, 200); // 4 rows of water (450px to 650px)

    // **Car Spawning Logic**: Spawn new cars at their own intervals
    if (framesUntilNextCar <= 0 && cars.length < maxCars) {
      spawnCar();
      framesUntilNextCar = carSpawnInterval; // Cars spawn at their own interval
    }
    framesUntilNextCar--;

    // Move and draw the cars
    for (let i = cars.length - 1; i >= 0; i--) {
      let c = cars[i];
      c.move();
      c.display();

      // Check for collisions with the frog
      if (c.collidesWithFrog(frogX, frogY, frogSize)) { // Collision check based on the frog size
        gameOver = true;
      }

      // Remove cars that go off the screen (based on direction)
      if ((c.speed > 0 && c.x > width + c.carWidth) || (c.speed < 0 && c.x < -c.carWidth)) {
        cars.splice(i, 1); // Remove the car from the array when it's off-screen
      }
    }

    // **Log Spawning Logic**: Spawn new logs twice as frequently as cars
    if (framesUntilNextLog <= 0 && logs.length < maxLogs) {
      spawnLog();
      framesUntilNextLog = logSpawnInterval; // Logs spawn at their own interval
    }
    framesUntilNextLog--;

    // Move and draw the logs
    for (let i = logs.length - 1; i >= 0; i--) {
      let l = logs[i];
      l.move();
      l.display();

      // Check if frog is on the log
      if (l.collidesWithFrog(frogX, frogY, frogSize)) {
        onLog = l;
      }

      // Remove logs that go off the screen (based on direction)
      if ((l.speed > 0 && l.x > width + l.logWidth) || (l.speed < 0 && l.x < -l.logWidth)) {
        logs.splice(i, 1); // Remove the log from the array when it's off-screen
        if (onLog === l) {
          gameOver = true; // If the frog is on the log when it despawns, the frog falls into the water
        }
      }
    }

    // Now draw the frog on top of logs
    image(frogSprite, frogX, frogY, frogSize, frogSize);

    // Check if the frog is in the water and not on a log
    if (frogY > 400 && frogY < 650 && !onLog) {
      gameOver = true; // Game over if the frog is in the water and not on a log
    }

    // Move the frog with the log if it's on one
    if (onLog) {
      frogX += onLog.speed;
    }

    // Reset the log status for the next frame
    onLog = null;

    // Check if frog reached the other side (level progression)
    if (frogY < 50) {
      level++;
      highScore = max(highScore, level); // Update high score if new level is higher
      nextLevel();
    }

    // Display level counter in the corner with left alignment
    fill(255);
    textAlign(LEFT);
    textSize(20);
    text("Level: " + level, 20, 30);
    text("Use Arrow Keys to Move", width - 250, height - 10);

    // Display high score in the top right corner
    textAlign(RIGHT);
    text("High Score: " + highScore, width - 20, 30);
  } else {
    // Game over screen
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Game Over", width / 2, height / 2);
    textSize(20);
    text("Press R to Restart", width / 2, height / 2 + 40);

    // Display high score on game over screen
    text("High Score: " + highScore, width / 2, height / 2 + 80);
  }
}

function keyPressed() {
  if (!gameOver) {
    // Frog movement with arrow keys, keeping grid-based movement
    let moveDistance = 50; // Maintain the grid step size
    if (keyCode === UP_ARROW) {
      frogY -= moveDistance;
    } else if (keyCode === DOWN_ARROW) {
      frogY += moveDistance;
    } else if (keyCode === LEFT_ARROW) {
      frogX -= moveDistance;
    } else if (keyCode === RIGHT_ARROW) {
      frogX += moveDistance;
    }

    // Constrain frog to screen boundaries
    frogX = constrain(frogX, 0, width - frogSize);
    frogY = constrain(frogY, 0, height - frogSize);
  } else {
    // Restart the game when pressing 'R'
    if (key === 'r' || key === 'R') {
      resetToFirstLevel();
    }
  }
}

// Car spawning logic with lane management and preventing overlap
function spawnCar() {
  let randomLaneIndex = Math.floor(random(lanes.length)); // Choose a random lane
  let randomLane = lanes[randomLaneIndex];
  let randomSpeed = random(2, 2 + level); // Increase car speed with level
  
  // Determine direction: even rows go left to right, odd rows go right to left
  let direction = randomLaneIndex % 2 === 0 ? 1 : -1;
  let startX = direction === 1 ? -100 : width + 100; // Start from left for left-to-right cars, right for right-to-left cars
  
  // Ensure no cars spawn too close in the same lane
  let canSpawn = true;
  for (let c of cars) {
    if (c.y === randomLane && abs(c.x - startX) < 200) {
      canSpawn = false;
    }
  }

  if (canSpawn) {
    cars.push(new Car(startX, randomLane, randomSpeed * direction, direction)); // Pass the direction to the car
  }
}

// Log spawning logic similar to cars
function spawnLog() {
  let randomLaneIndex = Math.floor(random(waterLanes.length)); // Choose a random lane in water
  let randomLane = waterLanes[randomLaneIndex];
  let randomSpeed = random(2, 2 + level); // Increase log speed with level
  
  // Determine direction: even rows go left to right, odd rows go right to left
  let direction = randomLaneIndex % 2 === 0 ? 1 : -1;
  let startX = direction === 1 ? -100 : width + 100; // Start from left for left-to-right logs, right for right-to-left logs
  
  // Ensure no logs spawn too close in the same lane
  let canSpawn = true;
  for (let l of logs) {
    if (l.y === randomLane && abs(l.x - startX) < 200) {
      canSpawn = false;
    }
  }

  if (canSpawn) {
    logs.push(new Log(startX, randomLane, randomSpeed * direction, 100)); // Fixed log size (width)
  }
}

function nextLevel() {
  frogX = width / 2 - frogSize / 2;
  frogY = height - 50;

  // Increase number of cars and logs with each level
  maxCars = min(maxCars + 2, 20); // Increased to allow more cars
  maxLogs = min(maxLogs + 2, 20); // Logs increase twice as fast
  
  // Adjust spawn intervals
  carSpawnInterval = max(carSpawnInterval - 5, 20); // More frequent car spawns
  logSpawnInterval = carSpawnInterval / 2; // Logs spawn twice as fast as cars

  cars = [];
  logs = [];
}

function resetGame() {
  frogX = width / 2 - 20;
  frogY = height - 50;
  frogSize = 40; // Set the initial size for the frog sprite

  gameOver = false;
  cars = [];
  logs = [];
}

function resetToFirstLevel() {
  gameOver = false;
  level = 1;
  maxCars = 6;
  maxLogs = 6;
  carSpawnInterval = 30;
  logSpawnInterval = 30;
  resetGame();
}

// Car class to handle individual car logic
class Car {
  constructor(tempX, tempY, tempSpeed, direction) {
    this.x = tempX;
    this.y = tempY;
    this.speed = tempSpeed;
    this.carWidth = 80; // Fixed size for cars
    this.carHeight = 40; // Fixed size for cars
    this.direction = direction;
  }

  move() {
    this.x += this.speed;
  }

  display() {
    if (this.direction === 1) {
      image(carRightSprite, this.x, this.y, this.carWidth, this.carHeight); // Display car moving right
    } else {
      image(carLeftSprite, this.x, this.y, this.carWidth, this.carHeight); // Display car moving left
    }
  }

  collidesWithFrog(frogX, frogY, frogSize) {
    return !(frogX + frogSize < this.x || frogX > this.x + this.carWidth || 
             frogY + frogSize < this.y || frogY > this.y + this.carHeight);
  }
}

// Log class similar to Car but for the water section
class Log {
  constructor(tempX, tempY, tempSpeed, tempWidth) {
    this.x = tempX;
    this.y = tempY;
    this.speed = tempSpeed;
    this.logWidth = tempWidth; // Fixed log width
    this.logHeight = 40; // Fixed log height
  }

  move() {
    this.x += this.speed;
  }

  display() {
    image(logSprite, this.x, this.y, this.logWidth, this.logHeight); // Display the log image
  }

  collidesWithFrog(frogX, frogY, frogSize) {
    // Shrink the log's bounding box by logCollisionMargin on both sides
    let leftEdge = this.x + logCollisionMargin;
    let rightEdge = this.x + this.logWidth - logCollisionMargin;
    return !(frogX + frogSize < leftEdge || frogX > rightEdge || 
             frogY + frogSize < this.y || frogY > this.y + this.logHeight);
  }
}
