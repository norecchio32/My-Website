// Player variables
let playerX, playerY;
let playerDiameter = 30;
let playerVelocityY = 0;
let gravity = 0.2;
let isJumping = false;
let playerSpeed = 5; // Movement speed
let jumpBoost = 0; // Boost for player jump height
let playerImage; // Player image

// Platform variables
let baseNumPlatforms = 10;
let numPlatforms = baseNumPlatforms;
let platformX = [];
let platformY = [];
let platformWidth = 60;
let platformHeight = 10;
let maxReachableHeight = 150; // Maximum height the player can jump to

let showSafetyNet = true; // Controls whether to show the safety net
let safetyNetTimer = 0;     // Timer to track when to hide the safety net
let safetyNetWidth = 400;   // Width of the safety net platform
let safetyNetHeight = 20;   // Height of the safety net

// Monster (bomb) variables
let baseNumMonsters = 3; // Base number of monsters
let numMonsters = baseNumMonsters;
let monsterX = [];
let monsterY = [];
let monsterDiameter = 20; // Size of monster
let monstersActive = false; // Monsters are inactive until score > 500
let monsterImage; // Monster image

// Coin variables
let coinX = [];
let coinY = [];
let coinDiameter = 15;
let coinBalance = 0; // Total coins collected across rounds
let additionalCoins = 0; // Coins earned from score at the end of the game
let coinImage; // Coin image

// Upgrades and costs
let platformUpgradeLevel = 0;
let monsterUpgradeLevel = 0;
let jumpUpgradeLevel = 0;
let upgradeCosts = [10, 20, 30, 40, 50]; // Costs for upgrades
let storeScreen = false; // Whether the player is in the store screen

// Score variables
let highestY = 0;
let score = 0;
let totalDistanceClimbed = 0; // Track the total vertical distance climbed
let highScore = 0;  // Track the highest score across the session

// Game state
let isGameOver = false;
let moveLeft = false;
let moveRight = false;
let startScreen = true; // Start with the start screen active
let titleScreenImage; // Declare a variable to store the title screen image
let gameOverImage; // Declare a variable to store the game-over screen image
let storeImage; // Declare a variable to store the store screen image

function preload() {
  // Load images
  playerImage = loadImage("assets/jumpman.png");
  monsterImage = loadImage("assets/monster.png");
  coinImage = loadImage("assets/coin.png");
  titleScreenImage = loadImage("assets/titlescreen.png"); // Load the title screen image
  gameOverImage = loadImage("assets/gameover.png"); // Load the game-over screen image
  storeImage = loadImage("assets/store.png"); // Load the store screen image
}

function setup() {
  createCanvas(400, 600);

  // Resize images if they exist
  if (playerImage) playerImage.resize(int(playerDiameter), int(playerDiameter));
  if (monsterImage) monsterImage.resize(int(monsterDiameter), int(monsterDiameter));
  if (coinImage) coinImage.resize(int(coinDiameter), int(coinDiameter));

  resetGame();
}

function resetGame() {
  playerX = width / 2;
  playerY = height / 2;
  playerVelocityY = 0;
  totalDistanceClimbed = 0;
  score = 0;
  isGameOver = false;
  monstersActive = false;
  additionalCoins = 0;
  showSafetyNet = true;
  safetyNetTimer = 0;
  numPlatforms = baseNumPlatforms + platformUpgradeLevel; // Apply platform upgrade
  numMonsters = baseNumMonsters - monsterUpgradeLevel; // Apply monster reduction upgrade
  jumpBoost = jumpUpgradeLevel * 2; // Apply jump height upgrade
  loop();

  // Initialize platforms
  platformX = [];
  platformY = [];
  for (let i = 0; i < numPlatforms; i++) {
    platformX[i] = random(width - platformWidth);
    platformY[i] = random(height);
  }

  // Initialize monsters off screen
  monsterX = [];
  monsterY = [];
  for (let i = 0; i < numMonsters; i++) {
    monsterX.push(random(width - monsterDiameter));
    monsterY.push(-random(100, 300));
  }

  // Initialize coins
  coinX = [];
  coinY = [];
  for (let i = 0; i < 3; i++) { // Start with 3 coins on the screen
    coinX.push(random(width - coinDiameter));
    coinY.push(-random(100, 300));
  }
}

function draw() {
  if (startScreen) {
    displayStartScreen();
  } else if (isGameOver) {
    if (storeScreen) {
      displayStore();
    } else {
      displayGameOver();
    }
  } else {
    gamePlay();
  }
}

function displayStartScreen() {
  if (titleScreenImage) {
    image(titleScreenImage, 0, 0, width, height); // Draw the title screen image
  } else {
    background(0); // Fallback in case the image fails to load
  }
}

function gamePlay() {
  background(135, 206, 250); // Light blue background

  // Safety net logic
  if (showSafetyNet) {
    fill(0, 0, 139); // Dark blue color for safety net
    rect(width / 2 - safetyNetWidth / 2, height - safetyNetHeight, safetyNetWidth, safetyNetHeight);

    safetyNetTimer += 1.0 / frameRate(); // Increment the timer
    if (safetyNetTimer >= 5) {
      showSafetyNet = false; // Hide the safety net after 5 seconds
    }
  }

  // Player gravity and movement
  playerVelocityY += gravity;
  playerY += playerVelocityY;

  // Move player left or right if keys are pressed
  if (moveLeft) {
    playerX -= playerSpeed;
  }
  if (moveRight) {
    playerX += playerSpeed;
  }

  // Screen wrapping: player wraps around horizontally
  if (playerX < 0) {
    playerX = width;
  } else if (playerX > width) {
    playerX = 0;
  }

  // Player jumping logic
  if (isJumping && playerVelocityY > 0) {
    isJumping = false;
  }

  // Check for platform collisions
  for (let i = 0; i < numPlatforms; i++) {
    if (playerY + playerDiameter / 2 >= platformY[i] &&
        playerY + playerDiameter / 2 <= platformY[i] + platformHeight &&
        playerX > platformX[i] && playerX < platformX[i] + platformWidth &&
        playerVelocityY > 0) {
      
      playerVelocityY = -10 - jumpBoost; // Apply jump boost
      isJumping = true;
    }
  }

  // Check for safety net collision
  if (showSafetyNet && 
      playerY + playerDiameter / 2 >= height - safetyNetHeight &&
      playerVelocityY > 0) {
    playerVelocityY = -10 - jumpBoost;
    isJumping = true;
  }

  // Handle coin behavior
  for (let i = 0; i < coinX.length; i++) {
    let cX = coinX[i];
    let cY = coinY[i];

    // Move coins down slowly
    cY += 2;

    // If the coin goes off the bottom, respawn it above
    if (cY > height) {
      cY = -random(100, 300);
      cX = random(width - coinDiameter);
    }

    // Update coin position
    coinX[i] = cX;
    coinY[i] = cY;

    // Check for coin collisions
    if (dist(playerX, playerY, cX, cY) < (playerDiameter / 2 + coinDiameter / 2)) {
      coinBalance++;
      cY = -random(100, 300);
      cX = random(width - coinDiameter);
      coinX[i] = cX;
      coinY[i] = cY;
    }

    // Draw coin
    if (coinImage) {
      image(coinImage, cX, cY);
    } else {
      fill(255, 215, 0);
      ellipse(cX, cY, coinDiameter, coinDiameter);
    }
  }

  // Activate monsters after score > 500
  if (score > 500 && !monstersActive) {
    monstersActive = true;
  }

  // Increase number of monsters as player progresses
  let additionalMonsters = score / 2000; // Add 1 monster every 2000 points
  let totalMonsters = numMonsters + additionalMonsters;

  // Add more monsters if necessary
  while (monsterX.length < totalMonsters) {
    monsterX.push(random(width - monsterDiameter));
    monsterY.push(-random(100, 300));
  }

  // Handle monster behavior
  if (monstersActive) {
    for (let i = 0; i < monsterX.length; i++) {
      let mX = monsterX[i];
      let mY = monsterY[i];
      
      // Move monsters down slowly
      mY += 2; 
      
      // If the monster goes off the bottom, respawn it above
      if (mY > height) {
        mY = -random(100, 300);
        mX = random(width - monsterDiameter);
      }

      // Update monster position
      monsterX[i] = mX;
      monsterY[i] = mY;

      // Check for monster collisions
      if (dist(playerX, playerY, mX, mY) < (playerDiameter / 2 + monsterDiameter / 2)) {
        isGameOver = true;
        additionalCoins = round(score / 1000.0); // Calculate additional coins based on score
        coinBalance += additionalCoins;
        checkAndUpdateHighScore(); // Update high score if needed
      }

      // Draw monster
      if (monsterImage) {
        image(monsterImage, mX, mY);
      } else {
        fill(255, 0, 0);
        ellipse(mX, mY, monsterDiameter, monsterDiameter);
      }
    }
  }

  // Scrolling logic
  if (playerY < height / 2) {
    let offset = (height / 2) - playerY;
    playerY = height / 2;

    // Move platforms down
    for (let i = 0; i < numPlatforms; i++) {
      platformY[i] += offset;
      if (platformY[i] > height) {
        platformY[i] = 0;
        platformX[i] = random(width - platformWidth);
      }
    }

    // Move monsters down if active
    if (monstersActive) {
      for (let i = 0; i < monsterX.length; i++) {
        monsterY[i] += offset;
      }
    }

    // Move coins down
    for (let i = 0; i < coinX.length; i++) {
      coinY[i] += offset;
    }

    // Increment total distance climbed
    totalDistanceClimbed += offset;
  }

  // Calculate score
  score = int(totalDistanceClimbed);

  // Player falls off screen (Game Over)
  if (playerY > height) {
    isGameOver = true;
    additionalCoins = round(score / 1000.0);
    coinBalance += additionalCoins;
    checkAndUpdateHighScore();
  }

  // Draw player
  if (playerImage) {
    image(playerImage, playerX - playerDiameter / 2, playerY - playerDiameter / 2);
  } else {
    fill(255);
    ellipse(playerX, playerY, playerDiameter, playerDiameter);
  }

  // Draw platforms
  for (let i = 0; i < numPlatforms; i++) {
    fill(0, 255, 0);
    rect(platformX[i], platformY[i], platformWidth, platformHeight);
  }

  // Draw score and high score
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Score: " + score, 10, 30);
  text("Coins: " + coinBalance, 10, 50);
  
  // Display high score on the top-right during gameplay
  textAlign(RIGHT);
  text("High Score: " + highScore, width - 10, 30);
}

function checkAndUpdateHighScore() {
  if (score > highScore) {
    highScore = score;
  }
}

function displayGameOver() {
  if (gameOverImage) {
    image(gameOverImage, 0, 0, width, height); // Draw the game-over screen image
    fill(200);
    textSize(32);
    textAlign(CENTER);
    text("Score: " + score, width / 2, height / 2);
    textSize(20);
    text("Coins Earned: " + additionalCoins, width / 2, height / 2 + 40);
    text("Total Coins: " + coinBalance, width / 2, height / 2 + 70);
    text("High Score: " + highScore, width / 2, height / 2 + 100);
    text("Press 'R' to return to Game", width / 2, height - 80);
    text("Press 'S' to visit the Store", width / 2, height - 40);
  }
}

function displayStore() {
  if (storeImage) {
    image(storeImage, 0, 0, width, height);

    fill(255);
    textAlign(CENTER);
    textSize(30);
    text("Coins: " + coinBalance, width / 2, 150);
    textSize(18);
    text("(Level " + platformUpgradeLevel + "): Cost: " + getUpgradeCost(platformUpgradeLevel), width / 2, 250);
    text("(Level " + monsterUpgradeLevel + "): Cost: " + getUpgradeCost(monsterUpgradeLevel), width / 2, 330);
    text("(Level " + jumpUpgradeLevel + "): Cost: " + getUpgradeCost(jumpUpgradeLevel), width / 2, 420);
  }
}

function getUpgradeCost(level) {
  if (level < upgradeCosts.length) {
    return upgradeCosts[level];
  } else {
    return 0; // Fully upgraded
  }
}

function keyPressed() {
  if (startScreen) {
    if (key === ' ') {
      startScreen = false;
      resetGame();
    }
  } else if (storeScreen) {
    handleStoreInput();
  } else if (isGameOver) {
    if (key === 's' || key === 'S') {
      storeScreen = true;
      redraw();  // Ensure the store screen is rendered
    } else if (key === 'r' || key === 'R') {
      resetGame();
    }
  } else {
    if (keyCode === LEFT_ARROW) {
      moveLeft = true;
    } else if (keyCode === RIGHT_ARROW) {
      moveRight = true;
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) {
    moveLeft = false;
  } else if (keyCode === RIGHT_ARROW) {
    moveRight = false;
  }
}

function handleStoreInput() {
  if (key === '1' && canUpgrade(platformUpgradeLevel)) {
    platformUpgradeLevel++;
    coinBalance -= getUpgradeCost(platformUpgradeLevel - 1);
    redraw();  // Immediately update the store screen
  } else if (key === '2' && canUpgrade(monsterUpgradeLevel)) {
    monsterUpgradeLevel++;
    coinBalance -= getUpgradeCost(monsterUpgradeLevel - 1);
    redraw();  // Immediately update the store screen
  } else if (key === '3' && canUpgrade(jumpUpgradeLevel)) {
    jumpUpgradeLevel++;
    coinBalance -= getUpgradeCost(jumpUpgradeLevel - 1);
    redraw();  // Immediately update the store screen
  } else if (key === 'r' || key === 'R') {
    storeScreen = false; // Exit the store and return to game-over screen
    redraw();  // Ensure game-over screen is drawn again
  }
}

function canUpgrade(upgradeLevel) {
  return upgradeLevel < upgradeCosts.length && coinBalance >= getUpgradeCost(upgradeLevel);
}
