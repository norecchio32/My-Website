let bird;
let pipes = [];
let clouds = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let firstRound = true;
let showTitleScreen = true; // Show title screen initially

let birdImg, cloudImg, titleImg;

let pipeDelay = 90; // Delay between pipe spawns
let pipeSpawnCounter = 0; // Counter to track pipe spawning delay

function preload() {
  // Load the bird, cloud, and title screen images
  birdImg = loadImage('assets/bird.png');
  cloudImg = loadImage('assets/cloud.png');
  titleImg = loadImage('assets/flappytitle.png'); // Title screen image
}

function setup() {
  createCanvas(600, 600);
  bird = new Bird();

  // Generate some clouds to start with
  for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud());
  }
}

function draw() {
  background(135, 206, 250); // Sky blue background

  // Show the title screen before the first round
  if (showTitleScreen) {
    image(titleImg, 0, 0, width, height); // Draw title image to cover the screen
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text('Press SPACE to Start', width / 2, height - 10);
    return; // Wait for the player to start the game
  }

  // Draw clouds first (background)
  for (let i = clouds.length - 1; i >= 0; i--) {
    clouds[i].update();
    clouds[i].show();

    // Recycle clouds if they move off the screen
    if (clouds[i].offscreen()) {
      clouds.splice(i, 1);
      clouds.push(new Cloud());
    }
  }

  // Game over condition
  if (gameOver) {
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text('Game Over', width / 2, height / 2 - 40);
    textSize(24);
    text('Score: ' + score, width / 2, height / 2);
    text('High Score: ' + highScore, width / 2, height / 2 + 40);
    textSize(20);
    text('Press R to Restart', width / 2, height / 2 + 80);
    noLoop(); // Stop the game
    return;
  }

  // Bird update and display
  bird.update();
  bird.show();

  // Pipe update and display
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].show();

    // Check if bird hits any pipe
    if (pipes[i].hits(bird)) {
      gameOver = true;
    }

    // Remove pipes off-screen
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
      score++; // Increase score when a pipe passes by
    }
  }

  // Add new pipes with a delay after the first pipe
  if (pipeSpawnCounter > pipeDelay) {
    pipes.push(new Pipe());
    pipeSpawnCounter = 0; // Reset the counter after spawning a pipe
  } else {
    pipeSpawnCounter++;
  }

  // Display current score
  fill(255);
  textSize(32);
  textAlign(LEFT);
  text('Score: ' + score, 10, 40);

  // Display high score
  textAlign(RIGHT);
  text('High Score: ' + highScore, width - 10, 40);
}

function keyPressed() {
  if (key === ' ') {
    if (showTitleScreen) {
      showTitleScreen = false; // Hide the title screen after the first start
      pipeSpawnCounter = -pipeDelay; // Delay the first pipe
    } else {
      bird.up();
    }
  }

  if (key === 'R' || key === 'r') {
    resetGame();
  }
}

function resetGame() {
  if (score > highScore) {
    highScore = score; // Update high score if necessary
  }
  score = 0;
  pipes = [];
  bird = new Bird();
  clouds = []; // Reset clouds as well
  for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud());
  }
  gameOver = false;
  pipeSpawnCounter = -pipeDelay; // Ensure first pipe spawns with proper delay
  loop(); // Restart the game loop
}

class Bird {
  constructor() {
    this.y = height / 2;
    this.x = 64;
    this.gravity = 0.6;
    this.lift = -15;
    this.velocity = 0;
    this.radius = 16; // Bird's radius (for collision detection)
  }

  show() {
    // Draw bird using the bird.png image
    image(birdImg, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }

  up() {
    this.velocity += this.lift; // Bird jumps
  }

  update() {
    this.velocity += this.gravity; // Apply gravity
    this.velocity *= 0.9; // Air resistance
    this.y += this.velocity;

    // Prevent the bird from falling off the screen
    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }

    // Prevent the bird from going above the screen
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
}

class Pipe {
  constructor() {
    this.spacing = 120; // Gap between pipes
    this.top = random(height / 6, 3 / 4 * height);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 40;
    this.speed = 3;
  }

  show() {
    fill(34, 139, 34); // Green pipes
    rect(this.x, 0, this.w, this.top); // Top pipe
    rect(this.x, height - this.bottom, this.w, this.bottom); // Bottom pipe
  }

  update() {
    this.x -= this.speed; // Move pipe left
  }

  offscreen() {
    return this.x < -this.w;
  }

  hits(bird) {
    // Check for collision with the top pipe
    if (bird.y - bird.radius < this.top && bird.x + bird.radius > this.x && bird.x - bird.radius < this.x + this.w) {
      return true; // Bird hits the top pipe
    }

    // Check for collision with the bottom pipe
    if (bird.y + bird.radius > height - this.bottom && bird.x + bird.radius > this.x && bird.x - bird.radius < this.x + this.w) {
      return true; // Bird hits the bottom pipe
    }

    return false;
  }
}

class Cloud {
  constructor() {
    this.x = random(width, width * 2); // Start clouds off-screen to the right
    this.y = random(height / 4, height / 2); // Random vertical position in the top half of the canvas
    this.speed = random(0.5, 2); // Random speed for each cloud
    this.size = random(50, 100); // Random cloud size
  }

  show() {
    image(cloudImg, this.x, this.y, this.size, this.size * 0.6); // Clouds are drawn from cloud.png
  }

  update() {
    this.x -= this.speed; // Move cloud to the left
  }

  offscreen() {
    return this.x < -this.size; // Cloud is off-screen to the left
  }
}
