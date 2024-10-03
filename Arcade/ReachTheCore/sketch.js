// Variables for drill movement
let drillX, drillY, horizontalSpeed;
let drilling, inGameOverScreen = false;  
let health, battery, maxHealth, maxBattery;
let coinCount = 0, highScore = 0, currentScore = 0, rocketBoosters = 0;
let coinsFromScore = 0;  
let gameOver;
let screenOffset = 0; 
let dayCounter = 1;  
let reachedCore = false;  
let showingWinMessage = false;

// Variables for dynamic speed
let drillAcceleration = 0.01;  
let maxDrillSpeed = 2.5;       
let currentDrillSpeed = 0;
let slowingDown = false;
let slowdownTimer = 0;
let usingRocket = false;  
let rocketBoostTimer = 0;     

// Variables for upgrades
let healthUpgradeLevel = 1, batteryUpgradeLevel = 1, rocketBoosterUpgradeLevel = 0, torqueUpgradeLevel = 1, motorUpgradeLevel = 1;
let healthUpgradeCost = 100, batteryUpgradeCost = 150, torqueUpgradeCost = 150, motorUpgradeCost = 250, rocketBoosterUpgradeCost = 100;

// Arrays for dynamic coins, obstacles, and rocket boosters
let coinPositions = [];
let obstaclePositions = [];
let obstacle2Positions = [];  
let rocketBoosterPositions = [];
let coinCollected = [];
let obstacleHit = [];
let obstacle2Hit = [];
let rocketBoosterCollected = [];

// Ground colors
let dirtColor, mantleColor, coreColor;

// Store trail positions
let trailPositions = [];

let inStore = false;
let upgradeUsed = false;  
let showStartText = true;
let showTitleScreen = true;

let excavator, coinImg, obstacleImg, obstacle2Img, rocketBoosterImg, flame, titleImage;  

function preload() {
    titleImage = loadImage('assets/rtctitle.png');
    excavator = loadImage('assets/excavator.png');
    flame = loadImage('assets/flame.png');
    coinImg = loadImage('assets/coin.png');
    obstacleImg = loadImage('assets/obstacle.png');
    obstacle2Img = loadImage('assets/obstacle2.png');
    rocketBoosterImg = loadImage('assets/rocketbooster.png');
  }
  

function setup() {
  createCanvas(600, 800);
  
  dirtColor = color(139, 69, 19);
  mantleColor = color(50, 0, 50);
  coreColor = color(255, 204, 0);

  titleImage.resize(600, 800);
  excavator.resize(120, 100);  
  flame.resize(50, 50);
  coinImg.resize(20, 20);  
  obstacleImg.resize(30, 30);  
  obstacle2Img.resize(40, 40);  
  rocketBoosterImg.resize(30, 30);

  resetGame();
}

function resetGame() {
    drillX = width / 2;
    drillY = 100;
    horizontalSpeed = 0.66 + torqueUpgradeLevel / 3;
  
    maxHealth = 1000 + healthUpgradeLevel * 1500;
    maxBattery = 1250 + batteryUpgradeLevel * 1750;
    health = maxHealth;
    battery = maxBattery;
  
    rocketBoosters = rocketBoosterUpgradeLevel;
    currentScore = 0;
    drilling = false;
    gameOver = false;
    inStore = false;
    inGameOverScreen = false;
    upgradeUsed = false;
    showingWinMessage = false;  // Add this to reset win message

    currentDrillSpeed = 0;
    screenOffset = 0;
    slowdownTimer = 0;
    rocketBoostTimer = 0;
    usingRocket = false;
  
    trailPositions = [];
    coinPositions = [];
    obstaclePositions = [];
    obstacle2Positions = [];
    rocketBoosterPositions = [];
    coinCollected = [];
    obstacleHit = [];
    obstacle2Hit = [];
    rocketBoosterCollected = [];
}


function draw() {
    if (showTitleScreen) {
        drawTitleScreen();
        return;
    }

    drawBackground();

    if (inStore) {
        drawStore();
        return;
    }

    if (inGameOverScreen) {
        drawGameOverSummaryScreen();
        return;
    }

    if (showingWinMessage) {
        drawWinMessage();
        return;
    }

    // Don't update the game logic if the game is over
    if (gameOver) {
        showGameOverScreen();
        return;  // Prevent further updates
    }

    drawTrail();

    if (drilling) {
        updateDrill();
    }

    drawDrill();
    drawCoins();
    drawObstacles();
    drawObstacle2();
    drawRocketBoosters();
    drawHUD();

    if (showStartText && !drilling && !gameOver) {
        drawStartText();
    }
}
 

function drawTitleScreen() {
  background(0);
  image(titleImage, 0, 0, width, height);
}

function drawBackground() {
  for (let y = 0; y < height; y++) {
    let depthFactor = map(y + screenOffset, 0, 10000, 0, 1);
    let currentGroundColor = lerpColor(dirtColor, mantleColor, depthFactor);
    stroke(currentGroundColor);
    line(0, y, width, y);
  }
  fill(135, 206, 235);
  rect(0, 300 - screenOffset - 300, width, 125);
}

function drawTrail() {
  fill(135, 206, 235);
  noStroke();
  for (let pos of trailPositions) {
    ellipse(pos.x, pos.y - screenOffset - 3, 50, 50);
  }
}

function drawStartText() {
  fill(255);
  textSize(20);
  textAlign(CENTER);
  text("Press Space to Start the Drill", width / 2, height / 2 - screenOffset);
  text("Use Left & Right Arrow Keys to Move", width / 2, height / 2 - screenOffset + 50);
  text("Use Down Arrow Key for Rocket Boosters", width / 2, height / 2 - screenOffset + 100);
}

function drawDrill() {
  image(excavator, drillX - 60, drillY - screenOffset - 70);
  if (usingRocket) {
    image(flame, drillX - 25, drillY - screenOffset - 110);
  }
}

function drawObstacle2() {
  if (currentScore > 10000) {
    for (let i = 0; i < obstacle2Positions.length; i++) {
      if (!obstacle2Hit[i]) {
        image(obstacle2Img, obstacle2Positions[i].x, obstacle2Positions[i].y - screenOffset);
      }
    }
  }
}

function updateDrill() {
    // Prevent updates if game is over or the win message is shown
    if (gameOver || showingWinMessage) {
        return;  // Stop updating the drill
    }

    // Check if player has reached the core and handle win condition
    if (currentScore >= 100000 && !reachedCore) {
        showingWinMessage = true;
        reachedCore = true;
        drilling = false;
        
        if (currentScore > highScore) {
            highScore = currentScore;
        }
        coinsFromScore = Math.round(currentScore / 100);

        return; // Exit the function once the core is reached
    }
  
    // Prevent updates if game is over or the win message is shown
    if (!gameOver && !showingWinMessage) {
      trailPositions.push(createVector(drillX, drillY));
  
      // Gradually increase drill speed
      if (!slowingDown && !usingRocket) {
        currentDrillSpeed = min(currentDrillSpeed + drillAcceleration, maxDrillSpeed + motorUpgradeLevel * 0.5);
      }
  
      if (slowingDown) {
        slowdownTimer--;
        if (slowdownTimer <= 0) {
          slowingDown = false;
        }
      }
  
      if (usingRocket) {
        rocketBoostTimer--;
        if (rocketBoostTimer <= 0) {
          usingRocket = false;
          currentDrillSpeed = maxDrillSpeed + motorUpgradeLevel * 0.5;
        }
      }
  
      // Update drill position
      drillY += currentDrillSpeed;
      currentScore = int(drillY);
  
      // Decrease health and battery
      health -= Math.floor(random(0, 3)); // Small health drain
      battery -= 1;  // Constant battery drain
  
      // Left and right movement logic
      if (keyIsDown(LEFT_ARROW)) {
        drillX -= (horizontalSpeed + torqueUpgradeLevel / 3);
        battery -= 2;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        drillX += (horizontalSpeed + torqueUpgradeLevel / 3);
        battery -= 2;
      }
      if (keyIsDown(DOWN_ARROW) && rocketBoosters > 0 && !usingRocket) {
        rocketBoosters--;
        usingRocket = true;
        currentDrillSpeed += 2.0;
        rocketBoostTimer = 100; // Rocket boost lasts for 100 frames
      }
  
      drillX = constrain(drillX, 50, width - 50);
  
      // Scroll screen when drill surpasses the middle of the screen
      if (drillY > height / 2 + screenOffset) {
        screenOffset = drillY - height / 2;
      }
  
      // **Spawning objects: Coins, Boosters, Obstacles, etc.**
      if (frameCount % 60 === 0) {
        let newCoin = createVector(random(50, width - 50), drillY + random(500, 1000));
        coinPositions.push(newCoin);
        coinCollected.push(false);
      }
  
      if (frameCount % 180 === 0) {
        let newBooster = createVector(random(50, width - 50), drillY + random(500, 1000));
        rocketBoosterPositions.push(newBooster);
        rocketBoosterCollected.push(false);
      }
  
      if (frameCount % 60 === 0) {
        let newObstacle = createVector(random(50, width - 50), drillY + random(500, 1000));
        obstaclePositions.push(newObstacle);
        obstacleHit.push(false);
      }
  
      if (currentScore > 10000 && frameCount % 100 === 0) {
        let newObstacle2 = createVector(random(50, width - 50), drillY + random(500, 1000));
        obstacle2Positions.push(newObstacle2);
        obstacle2Hit.push(false);
      }
  
      // Coin collection logic
      for (let i = 0; i < coinPositions.length; i++) {
        if (!coinCollected[i]) {
          if (dist(drillX - 10, drillY - 5, coinPositions[i].x, coinPositions[i].y) < (25 + 10)) {
            coinCount += 10;
            coinCollected[i] = true;
          }
        }
      }
  
      // Rocket booster collection
      for (let i = 0; i < rocketBoosterPositions.length; i++) {
        if (!rocketBoosterCollected[i]) {
          if (dist(drillX - 10, drillY - 5, rocketBoosterPositions[i].x, rocketBoosterPositions[i].y) < (25 + 15)) {
            rocketBoosters++;
            rocketBoosterCollected[i] = true;
          }
        }
      }
  
      // Obstacle collision logic
      for (let i = 0; i < obstaclePositions.length; i++) {
        if (!obstacleHit[i]) {
          if (dist(drillX - 10, drillY - 5, obstaclePositions[i].x, obstaclePositions[i].y) < (25 + 15)) {
            health -= 250;
            obstacleHit[i] = true;
            slowingDown = true;
            currentDrillSpeed = max(currentDrillSpeed - 1.0, 1.0);
            slowdownTimer = 100;
          }
        }
      }

      // **Add obstacle2 collision logic here**
      for (let i = 0; i < obstacle2Positions.length; i++) {
        if (!obstacle2Hit[i]) {
          if (dist(drillX - 10, drillY - 5, obstacle2Positions[i].x, obstacle2Positions[i].y) < (25 + 20)) {
                health -= 1000;  // Adjust the damage as needed
                obstacle2Hit[i] = true;
                slowingDown = true;
                currentDrillSpeed = max(currentDrillSpeed - 3.0, 1.0);
                slowdownTimer = 100;
          }
        }
      }
  
      // Transition to the game-over screen when health or battery is <= 0
      if (health <= 0 || battery <= 0) {
        gameOver = true;
        drilling = false;
  
        // Update score and coins only once
        if (currentScore > highScore) {
          highScore = currentScore;
        }
        coinsFromScore = Math.round(currentScore / 100);
        inGameOverScreen = true;

        return;  // Prevent further updates once the game is over
      }
    }
  }
  
  function keyPressed() {
    if (showTitleScreen && key === ' ') {
        showTitleScreen = false;
        return;
    }

    // Handle win message logic
    if (showingWinMessage && key === 's') {
        showingWinMessage = false;
        inGameOverScreen = true;
        coinCount += coinsFromScore;

        if (currentScore > highScore) {
            highScore = currentScore;
        }
        reachedCore = true;
        return;
    }

    // Start drilling if the player presses space and the game isn't in a game over, store, or win screen
    if (key === ' ' && !drilling && !gameOver && !inStore && !showingWinMessage) {
        drilling = true;
        showStartText = false;
    }

    // Handle store interactions if the player is in the store and hasn't used an upgrade yet
    if (inStore && !upgradeUsed) {
        // Health upgrade
        if (key === '1' && coinCount >= healthUpgradeCost && healthUpgradeLevel < 10) {
            healthUpgradeLevel++;
            coinCount -= healthUpgradeCost;
            healthUpgradeCost += 50;
            upgradeUsed = true;
        }
        // Battery upgrade
        if (key === '2' && coinCount >= batteryUpgradeCost && batteryUpgradeLevel < 10) {
            batteryUpgradeLevel++;
            coinCount -= batteryUpgradeCost;
            batteryUpgradeCost += 50;
            upgradeUsed = true;
        }
        // Torque upgrade
        if (key === '3' && coinCount >= torqueUpgradeCost && torqueUpgradeLevel < 10) {
            torqueUpgradeLevel++;
            coinCount -= torqueUpgradeCost;
            torqueUpgradeCost += 50;
            upgradeUsed = true;
        }
        // Motor upgrade
        if (key === '4' && coinCount >= motorUpgradeCost && motorUpgradeLevel < 10) {
            motorUpgradeLevel++;
            coinCount -= motorUpgradeCost;
            motorUpgradeCost += 50;
            upgradeUsed = true;
        }
        // Rocket booster upgrade
        if (key === '5' && coinCount >= rocketBoosterUpgradeCost && rocketBoosterUpgradeLevel < 9) {
            rocketBoosterUpgradeLevel++;
            coinCount -= rocketBoosterUpgradeCost;
            rocketBoosterUpgradeCost += 25;
            upgradeUsed = true;
        }
    }


    // Handle press 'S' to start the next round from the store or game over screen
    if (key === 's') {
        if (inStore) {
            resetGame();
            inStore = false;
            upgradeUsed = false;
        }

        if (inGameOverScreen) {
            inGameOverScreen = false;
            resetGame();
        }
    }

    // Handle moving to the next round from the game over summary
    if (key === 'n' && inGameOverScreen) {
        coinCount += coinsFromScore;
        dayCounter++;
        resetGame();
        inGameOverScreen = false; // Ensure the game exits the game over screen
    }

    // Handle going to the store from the game over summary
    if (key === 'r' && inGameOverScreen) {
        coinCount += coinsFromScore;
        inStore = true;
        dayCounter++;
        inGameOverScreen = false; // Exit the game over screen and enter the store
    }
}
    
  function drawCoins() {
    for (let i = 0; i < coinPositions.length; i++) {
      if (!coinCollected[i]) {
        image(coinImg, coinPositions[i].x, coinPositions[i].y - screenOffset);
      }
    }
  }
  
  function drawObstacles() {
    for (let i = 0; i < obstaclePositions.length; i++) {
      if (!obstacleHit[i]) {
        image(obstacleImg, obstaclePositions[i].x, obstaclePositions[i].y - screenOffset);
      }
    }
  }
  
  function drawRocketBoosters() {
    for (let i = 0; i < rocketBoosterPositions.length; i++) {
      if (!rocketBoosterCollected[i]) {
        image(rocketBoosterImg, rocketBoosterPositions[i].x, rocketBoosterPositions[i].y - screenOffset);
      }
    }
  }
  
  function drawHUD() {
    fill(100);
    rect(10, 10, 225, 240);
  
    textAlign(LEFT);
    fill(255, 0, 0);
    rect(20, 20, map(health, 0, maxHealth, 0, 200), 20);
    fill(255);
    text("Health: " + health + "/" + maxHealth, 20, 60);
  
    fill(0, 255, 0);
    rect(20, 80, map(battery, 0, maxBattery, 0, 200), 20);
    fill(255);
    text("Battery: " + battery + "/" + maxBattery, 20, 120);
  
    textSize(20);
    fill(245, 255, 100);
    text("Coins: " + coinCount, 20, 150);
    fill(255);
    text("High Score: " + highScore + "m", 20, 170);
    text("Current Score: " + currentScore + "m", 20, 200);
    text("Speed: " + nf(currentDrillSpeed, 1, 2), 20, 220);
    
    text("Boosters: " + rocketBoosters, 20, 240);
  
    textAlign(RIGHT);
    text("Day: " + dayCounter, width - 20, 30);
  }
  
  function drawUpgradeButtons(x, y, level) {
    let buttonSize = 20;
    for (let i = 0; i < 10; i++) {
      if (level >= 10) {
        fill(0);
      } else if (i < level) {
        fill(0, 255, 0);
      } else {
        fill(255);
      }
      rect(x + i * (buttonSize + 5), y, buttonSize, buttonSize);
    }
  }
  
  function drawStore() {
    background(50, 100, 50);
  
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Welcome to the Store!", width / 2, 50);
    fill(245, 255, 100);
    textSize(24);
    text("Coins: " + coinCount, width / 2, 100);
  
    textSize(18);
    fill(255);
    text("Press 1 to Upgrade Health. " + "Cost: " + healthUpgradeCost, width / 2, 150);
    drawUpgradeButtons(170, 170, healthUpgradeLevel);
    fill(255);
    text("Press 2 to Upgrade Battery. " + "Cost: " + batteryUpgradeCost, width / 2, 250);
    drawUpgradeButtons(170, 270, batteryUpgradeLevel);
    
    fill(255);
    text("Press 3 to Upgrade Torque. " + "Cost: " + torqueUpgradeCost, width / 2, 350);
    drawUpgradeButtons(170, 370, torqueUpgradeLevel);
    
    fill(255);
    text("Press 4 to Upgrade Motor. " + "Cost: " + motorUpgradeCost, width / 2, 450);
    drawUpgradeButtons(170, 470, motorUpgradeLevel);
    
    fill(255);
    text("Press 5 to Upgrade Rockets. " + "Cost: " + rocketBoosterUpgradeCost, width / 2, 550);
    drawUpgradeButtons(170, 570, rocketBoosterUpgradeLevel + 1);
  
    textSize(24);
    text("Press 'S' to start next round.", width / 2, height - 50);
  }
 
  function drawGameOverSummaryScreen() {
    background(50, 50, 50);
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("Round Summary", width / 2, 100);
    text("Score: " + currentScore + " meters", width / 2, 150);
    text("Coins Collected: " + coinCount, width / 2, 200);
    text("Coins Earned (from Score): " + coinsFromScore, width / 2, 250);
    text("Total Coins: " + (coinCount + coinsFromScore), width / 2, 300);

    textSize(18);
    text("Press 'N' for Next Round", width / 2, 400);
    text("Press 'R' to go to the Store", width / 2, 450);
}
  
  function drawWinMessage() {
    fill(0, 0, 0, 200);  
    rect(0, 0, width, height);
  
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text("You have reached the core!", width / 2, height / 2 - 50);
    text("It took you " + dayCounter + " days.", width / 2, height / 2);
  
    textSize(24);
    text("Score: " + currentScore + " meters", width / 2, height / 2 + 50);  
    text("Coins Earned: " + coinsFromScore, width / 2, height / 2 + 80);  
  
    text("Press 'S' to continue.", width / 2, height / 2 + 120);
  }
  
  function keyReleased() {
    // Allow upgrading again after key is released
    upgradeUsed = false;
}