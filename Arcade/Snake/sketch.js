// Constants
let cols, rows;
let scl = 35; // Scale for the size of the snake and food
let snake;
let food;
let powerUp;      // Position for stopwatch power-up
let fastForward;  // Position for fast forward power-up
let score = 0;
let highScore = 0;
let totalScore = 0;
let gamesPlayed = 0;
let gameOver = false;
let canChangeDirection = true; // Flag to prevent rapid direction changes
let powerUpActive = false;     // Flag for active power-up
let fastForwardActive = false; // Flag for fast forward power-up
let currentFrameRate = 10;     // Starting frame rate, changes as score increases
let effectiveFrameRate = 10;   // The real-time frame rate considering power-ups
let powerUpDurationSeconds = 5.0;  // Power-up duration in seconds
let powerUpStartTime = 0;      // Time when the power-up was activated
let showTitleScreen = true;

let appleImage, stopwatchImage, fastForwardImage, titleImage, snakeHeadImage; // Add snake head image

function preload() {
  // Load images
  appleImage = loadImage("assets/apple.png");
  stopwatchImage = loadImage("assets/stopwatch.png");
  fastForwardImage = loadImage("assets/fastforward.png");
  titleImage = loadImage("assets/snaketitle.png");
  snakeHeadImage = loadImage("assets/snakehead.png");
}

function setup() {
  createCanvas(595, 620);
  frameRate(currentFrameRate);
  cols = floor(width / scl);
  rows = floor(height / scl);

  appleImage.resize(scl, scl);
  stopwatchImage.resize(scl, scl);
  fastForwardImage.resize(scl, scl);
  snakeHeadImage.resize(scl, scl); // Resize the snake head to match the scale
  titleImage.resize(width, height); // Resize to fill the screen

  // Initialize snake
  snake = new Snake();

  // Initialize food and power-ups
  food = createFood();
  powerUp = createPowerUp();
  fastForward = createFastForward();
}

function draw() {
  if (showTitleScreen) {
    image(titleImage, 0, 0); // Display the title screen image
    return;
  }

  background(200);

  // Draw the checkered grid
  drawCheckeredGrid();

  // Check if game is over
  if (gameOver) {
    fill(230);
    rect(width / 2 - 125, height / 2 - 60, 250, 120);
    fill(0);
    textSize(22);
    textAlign(CENTER, CENTER);
    text(`Game Over! Score: ${score}`, width / 2, height / 2 - 40);
    textSize(16);
    
    // Calculate average score
    let averageScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;
    
    text(`High Score: ${highScore}`, width / 2, height / 2);
    text(`Average Score: ${averageScore.toFixed(2)}`, width / 2, height / 2 + 20);
    text("Press 'R' to Restart", width / 2, height / 2 + 40);
    return;
  }

  // Check if the power-up is still active
  if ((powerUpActive || fastForwardActive) && millis() - powerUpStartTime < powerUpDurationSeconds * 1000) {
    frameRate(effectiveFrameRate); // Apply the effective frame rate
    let timeRemaining = (powerUpDurationSeconds * 1000 - (millis() - powerUpStartTime)) / 1000.0;
    showClock(timeRemaining);
  } else {
    powerUpActive = false;
    fastForwardActive = false;
    currentFrameRate = 5 + score * 0.5; // Increase base frame rate as score increases
    effectiveFrameRate = currentFrameRate; // Set effective frame rate to base frame rate
    frameRate(effectiveFrameRate); // Apply frame rate
  }

  // Snake behavior
  snake.update();
  snake.show();

  // Allow direction change after snake moves
  canChangeDirection = true;

  // Check if snake eats the apple
  if (snake.eat(food)) {
    food = createFood();
    score++;
  }

  // Check if snake eats the stopwatch (power-up)
  if (snake.eat(powerUp)) {
    powerUp = createPowerUp();
    activatePowerUp();
  }

  // Check if snake eats the fast forward (power-up)
  if (snake.eat(fastForward)) {
    fastForward = createFastForward();
    activateFastForward();
  }

  // Draw the apple (food)
  image(appleImage, food.x * scl, food.y * scl);

  // Draw the stopwatch (power-up)
  image(stopwatchImage, powerUp.x * scl, powerUp.y * scl);

  // Draw the fast forward (power-up)
  image(fastForwardImage, fastForward.x * scl, fastForward.y * scl);

  // Display score
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text(`Score: ${score}`, width / 2, height - 10);
  textAlign(LEFT);
  text(`Speed: ${effectiveFrameRate.toFixed(1)}`, 10, height - 10); // Show effective frame rate
}

function keyPressed() {
  if (showTitleScreen && key == ' ') {
    showTitleScreen = false; // Hide title screen and start game
    return;
  }
  if (canChangeDirection) {
    if (keyCode === UP_ARROW && snake.ySpeed !== 1) {
      snake.setDirection(0, -1);
    } else if (keyCode === DOWN_ARROW && snake.ySpeed !== -1) {
      snake.setDirection(0, 1);
    } else if (keyCode === LEFT_ARROW && snake.xSpeed !== 1) {
      snake.setDirection(-1, 0);
    } else if (keyCode === RIGHT_ARROW && snake.xSpeed !== -1) {
      snake.setDirection(1, 0);
    }
    canChangeDirection = false; // Block further direction changes until snake moves
  }

  if (key === 'r' || key === 'R') {
    restartGame();
  }
}

// Function to restart the game
function restartGame() {
  // Update high score and average score
  if (score > highScore) {
    highScore = score;
  }
  totalScore += score;
  gamesPlayed++;

  // Reset snake, food, and power-ups
  snake = new Snake();
  food = createFood();
  powerUp = createPowerUp();
  fastForward = createFastForward();
  score = 0;
  gameOver = false;
  powerUpActive = false;
  fastForwardActive = false;
  currentFrameRate = 10; // Reset to base frame rate
  frameRate(currentFrameRate);
}

// Function to generate food at a random location
function createFood() {
  let x = floor(random(cols));
  let y = floor(random(rows));
  return createVector(x, y);
}

// Function to generate power-up (stopwatch) at a random location
function createPowerUp() {
  let x = floor(random(cols));
  let y = floor(random(rows));
  return createVector(x, y);
}

// Function to generate fast forward power-up at a random location
function createFastForward() {
  let x = floor(random(cols));
  let y = floor(random(rows));
  return createVector(x, y);
}

// Function to activate the stopwatch power-up
function activatePowerUp() {
  powerUpActive = true;
  effectiveFrameRate = currentFrameRate / 2; // Halve the speed
  frameRate(effectiveFrameRate); // Set the slowed down frame rate
  powerUpStartTime = millis(); // Record the time when the power-up starts
}

// Function to activate the fast forward power-up
function activateFastForward() {
  fastForwardActive = true;
  effectiveFrameRate = currentFrameRate * 1.5; // Increase speed by 150%
  frameRate(effectiveFrameRate); // Set the faster frame rate
  powerUpStartTime = millis(); // Record the time when the power-up starts
}

// Function to display countdown clock for active power-up
function showClock(timeRemaining) {
  fill(0);
  textSize(16);
  textAlign(RIGHT);
  text(`Power-up ends in: ${timeRemaining.toFixed(1)}s`, width - 10, height - 10); // Display time remaining
}

// Function to draw the checkered grid
function drawCheckeredGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if ((i + j) % 2 === 0) {
        fill(210);
      } else {
        fill(225);
      }
      rect(i * scl, j * scl, scl, scl);
    }
  }
}

// Snake class
class Snake {
  constructor() {
    this.body = [];
    this.body.push(createVector(floor(cols / 2), floor(rows / 2)));
    this.xSpeed = 1;
    this.ySpeed = 0;
  }

  setDirection(x, y) {
    this.xSpeed = x;
    this.ySpeed = y;
  }

  update() {
    let head = this.body[0].copy();
    head.x += this.xSpeed;
    head.y += this.ySpeed;

    // Check for boundary collisions
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      gameOver = true;
      return;
    }

    // Check for self-collision
    for (let segment of this.body) {
      if (head.equals(segment)) {
        gameOver = true;
        return;
      }
    }

    // Move the snake
    this.body.unshift(head);
    if (!this.eat(food)) {
      this.body.pop();
    }
  }

  show() {
    // Draw the snake body
    fill(150, 195, 95);
    for (let i = 1; i < this.body.length; i++) {
      let segment = this.body[i];
      rect(segment.x * scl, segment.y * scl, scl, scl);
    }

    // Draw the snake head using the snakehead image
    let head = this.body[0];

    push(); // Save current transformation matrix
    translate(head.x * scl + scl / 2, head.y * scl + scl / 2); // Move to the center of the head

    // Rotate the head based on the direction of movement
    if (this.xSpeed === 1) {
      // Moving right, no rotation needed
      rotate(-PI / 2);
    } else if (this.xSpeed === -1) {
      // Moving left, rotate 180 degrees (PI)
      rotate(PI / 2);
    } else if (this.ySpeed === -1) {
      // Moving up, rotate 90 degrees counterclockwise (-PI/2)
      rotate(-PI);
    } else if (this.ySpeed === 1) {
      // Moving down, rotate 90 degrees clockwise (PI/2)
      rotate(0);
    }

    image(snakeHeadImage, -30, -20, scl + 25, scl + 25); // Draw snake head image

    pop(); // Restore original transformation matrix
  }

  // Check if the snake eats food or power-up
  eat(pos) {
    let head = this.body[0];
    return head.x === pos.x && head.y === pos.y;
  }
}
